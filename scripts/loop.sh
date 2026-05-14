#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# loop.sh — Autonomous builder for the Battleground Overlay project
#
# Stack: OpenCode + local MLX (Qwen3.6-35B-A3B-4bit at :8080)
#
# Each iteration:
#   1. snapshot HEAD
#   2. run OpenCode with scripts/loop-prompt.md
#   3. verify `bun test` + `bun typecheck` pass
#   4. revert to snapshot if anything failed (and quarantine the task)
#   5. log DONE/REVERTED to logs/fixed-<stamp>.log
#
# Usage:
#   ./scripts/loop.sh                   # run until --max-time
#   ./scripts/loop.sh --iters 5
#   ./scripts/loop.sh --iters 1 --debug
# ---------------------------------------------------------------------------
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
PROMPT_FILE="$REPO/scripts/loop-prompt.md"
SUPERVISE_PROMPT_FILE="$REPO/scripts/supervise-prompt.md"
MODEL="mlx//Users/kbux/.cache/mlx/Qwen3.6-35B-A3B-4bit"
MLX_URL="http://localhost:8080/v1/models"

# Supervisor uses cloud Claude (Haiku) instead of local Qwen — much more
# reliable Read/Bash/Grep tooling. Budget cap protects against runaway spend.
SUPERVISE_MODEL="haiku"
SUPERVISE_BUDGET_USD="0.25"
SUPERVISE_TIMEOUT=240

LOG_DIR="$REPO/logs"
mkdir -p "$LOG_DIR"
STAMP=$(date +%Y%m%d-%H%M)
LOG="$LOG_DIR/loop-$STAMP.log"
FIXED_LOG="$LOG_DIR/fixed-$STAMP.log"

MAX_ITERS=999
SLEEP_BETWEEN=5
MAX_TIME_HOURS=12
DEBUG=0
ITER_TIMEOUT=720
STUCK_THRESHOLD=3
# Shell supervisor — cheap, runs every N iters; catches obvious stale tasks.
SUPERVISE_EVERY=3
# Haiku supervisor — semantic; runs every N iters; catches stale tasks where
# the deliverable exists under a different name. Costs ~$0.15/pass.
SUPERVISE_HAIKU_EVERY=15

# Tracks the last successfully-extracted CHOSEN TASK across iterations, so
# we can detect when the model picks the same failing task back-to-back.
LAST_CHOSEN=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --iters)     MAX_ITERS="$2";       shift 2 ;;
    --sleep)     SLEEP_BETWEEN="$2";   shift 2 ;;
    --max-time)  MAX_TIME_HOURS="$2";  shift 2 ;;
    --timeout)   ITER_TIMEOUT="$2";    shift 2 ;;
    --debug)     DEBUG=1;              shift   ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

log()       { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }
log_fixed() { echo "$*" | tee -a "$FIXED_LOG" >> "$LOG"; }

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------
preflight() {
  local fail=0

  curl -s --max-time 3 "$MLX_URL" >/dev/null 2>&1 \
    || { log "FAIL: MLX server not responding at $MLX_URL — run ./scripts/start-mlx-server.sh first"; fail=1; }

  command -v opencode >/dev/null 2>&1 \
    || { log "FAIL: opencode not in PATH"; fail=1; }

  command -v claude >/dev/null 2>&1 \
    || { log "FAIL: claude not in PATH (supervisor uses it)"; fail=1; }

  command -v bun >/dev/null 2>&1 \
    || { log "FAIL: bun not in PATH"; fail=1; }

  command -v gtimeout >/dev/null 2>&1 \
    || { log "FAIL: gtimeout not in PATH (brew install coreutils)"; fail=1; }

  [[ -f "$PROMPT_FILE" ]] \
    || { log "FAIL: prompt file missing at $PROMPT_FILE"; fail=1; }

  git -C "$REPO" pull --ff-only origin main >/dev/null 2>&1 || true

  if ! git -C "$REPO" diff --quiet || ! git -C "$REPO" diff --cached --quiet; then
    log "FAIL: repo has uncommitted changes — commit/stash first"
    fail=1
  fi

  [[ $fail -eq 0 ]] || exit 1
  log "Preflight OK."
}

# ---------------------------------------------------------------------------
# Recovery — when 3 iterations fail in a row, inject a small concrete task
# ---------------------------------------------------------------------------
# Normalize a CHOSEN-TASK string into a stable search key: strip backslashes
# (the model emits escaped backticks like \`foo\` which never match real `foo`
# in the backlog), collapse whitespace, drop leading "- [ ] [S] " markers.
normalize_chosen() {
  echo "$1" \
    | tr -d '\\' \
    | sed -E 's/^- \[[^]]*\] \[[A-Z]\] *//' \
    | tr -s '[:space:]' ' ' \
    | sed -E 's/^ +//; s/ +$//'
}

# Try to locate a chosen task line in the backlog. Echoes the matching line
# number, or empty if no match. Tries progressively shorter prefix lengths
# to handle minor formatting drift.
locate_backlog_line() {
  local needle_norm="$1"
  for prefix_len in 60 45 30; do
    local key="${needle_norm:0:$prefix_len}"
    [[ -z "$key" ]] && continue
    local lineno
    lineno=$(grep -nF "$key" "$REPO/docs/loop-backlog.md" 2>/dev/null \
      | grep -E ':-\s*\[' \
      | head -1 \
      | cut -d: -f1)
    if [[ -n "$lineno" ]]; then
      echo "$lineno"
      return 0
    fi
  done
  return 1
}

# Flip a task line's marker to [Q] and append a reason comment, then commit.
# Returns 0 on success, 1 if the line couldn't be located.
quarantine_task() {
  local chosen="$1"
  local reason="$2"
  local needle_norm
  needle_norm=$(normalize_chosen "$chosen")
  [[ -z "$needle_norm" ]] && return 1

  if ! grep -q "^## Quarantined" "$REPO/docs/loop-backlog.md"; then
    printf '\n---\n\n## Quarantined (failed — DO NOT pick)\n\n' \
      >> "$REPO/docs/loop-backlog.md"
  fi

  local lineno
  lineno=$(locate_backlog_line "$needle_norm") || {
    log "  ⚠ could not locate task line for quarantine: ${needle_norm:0:60}"
    return 1
  }

  local existing
  existing=$(sed -n "${lineno}p" "$REPO/docs/loop-backlog.md")
  [[ "$existing" =~ ^-\ \[[\ xQ]\] ]] || return 1

  local flipped
  flipped=$(echo "$existing" | sed -E "s/^- \[[ x]\]/- [Q]/")
  sed -i '' "${lineno}d" "$REPO/docs/loop-backlog.md"
  printf '%s  <!-- %s -->\n' "$flipped" "$reason" >> "$REPO/docs/loop-backlog.md"
  log "  ↪ Quarantined ($reason): $(echo "$chosen" | head -c 80)"
  return 0
}

# Check whether the chosen task line is still unchecked ([ ]) in the backlog.
# Returns 0 if [ ], 1 if [x] (already done), 2 if [Q] (quarantined), 3 if not found.
check_chosen_marker() {
  local chosen="$1"
  local needle_norm
  needle_norm=$(normalize_chosen "$chosen")
  [[ -z "$needle_norm" ]] && return 3

  local lineno
  lineno=$(locate_backlog_line "$needle_norm") || return 3

  local line
  line=$(sed -n "${lineno}p" "$REPO/docs/loop-backlog.md")
  case "$line" in
    "- [ ] "*) return 0 ;;
    "- [x] "*) return 1 ;;
    "- [Q] "*) return 2 ;;
    *)         return 3 ;;
  esac
}

# Push local commits to origin/main after pulling-rebase. Returns 0 on
# success (or nothing to push), 1 if push failed. Safe to call after
# every successful iteration or supervisor pass.
push_if_ahead() {
  local context="$1"
  git -C "$REPO" pull --rebase origin main >/dev/null 2>&1 || true
  local ahead
  ahead=$(git -C "$REPO" rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)
  [[ "$ahead" -eq 0 ]] && return 0
  if git -C "$REPO" push origin main >>"$LOG" 2>&1; then
    log "  ↑ pushed $ahead commit(s) to origin/main ($context)"
    return 0
  else
    log "  ⚠ push failed ($context — will retry next push)"
    return 1
  fi
}

# ---------------------------------------------------------------------------
# Shell supervisor — runs every $SUPERVISE_EVERY iterations. Walks the next
# 5 unchecked [S]/[M] tasks above the Quarantined section. Skips test-
# addition tasks (cannot judge equivalence without LLM), then for "create
# symbol X" tasks, greps production code for an export of X. If found,
# flips [ ] → [x] with `<!-- already at path:line -->`. Free, ~1s, safe.
# ---------------------------------------------------------------------------
run_supervisor_shell() {
  local n="$1"
  log "  → supervisor-shell (after iter $n)"

  local stale=0 looked=0
  local max_look=5

  local quarantine_line
  quarantine_line=$(grep -n '^## Quarantined' "$REPO/docs/loop-backlog.md" \
    | head -1 | cut -d: -f1)
  [[ -z "$quarantine_line" ]] && quarantine_line=999999

  while IFS=: read -r lineno line; do
    [[ $looked -ge $max_look ]] && break
    [[ "$lineno" -ge "$quarantine_line" ]] && break
    looked=$((looked + 1))

    # Skip test-addition tasks — Haiku handles those.
    case "$line" in
      *test*|*Test*|*.test.ts*) continue ;;
    esac

    local title
    title=$(echo "$line" | awk -F'—' '{print $1}')
    local sym
    sym=$(echo "$title" | grep -oE '`[A-Za-z_][A-Za-z0-9_]*`' \
            | head -1 | tr -d '`')
    [[ -z "$sym" ]] && continue
    case "$sym" in function|const|class|export|test|it|describe) continue ;; esac

    local where
    where=$(rg -n "^export (async )?(function|const|class) ${sym}\\b" \
              packages/ apps/ scripts/ --type ts -g '!*.test.ts' 2>/dev/null \
              | head -1)
    if [[ -n "$where" ]]; then
      local existing flipped
      existing=$(sed -n "${lineno}p" "$REPO/docs/loop-backlog.md")
      flipped=$(printf '%s' "$existing" \
        | sed -E 's/^- \[ \]/- [x]/' \
        | sed "s| *$| <!-- already at ${where%%:*}:${where#*:} -->|" \
        | sed "s|:export.*$||")
      awk -v ln="$lineno" -v new="$flipped" 'NR==ln{print new; next}1' \
        "$REPO/docs/loop-backlog.md" > "$REPO/docs/loop-backlog.md.tmp" \
        && mv "$REPO/docs/loop-backlog.md.tmp" "$REPO/docs/loop-backlog.md"
      stale=$((stale + 1))
      log "  ↪ stale: \`$sym\` (line $lineno) → ${where%%:*}"
    fi
  done < <(grep -nE '^- \[ \] \[[SM]\]' "$REPO/docs/loop-backlog.md")

  if [[ $stale -gt 0 ]]; then
    git -C "$REPO" add docs/loop-backlog.md
    git -C "$REPO" commit -m "chore(supervise-shell): $stale stale task(s)" \
      --quiet 2>/dev/null || true
  fi

  log "  SUPERVISE-SHELL: $stale stale, $looked looked at"

  local depth
  depth=$(grep -cE '^- \[ \] \[[SM]\]' "$REPO/docs/loop-backlog.md")
  if [[ $depth -lt 10 ]]; then
    log "  ⚠ backlog depth $depth unchecked — replenish soon"
  fi

  push_if_ahead "supervisor-shell"
}

# ---------------------------------------------------------------------------
# Haiku supervisor — runs every $SUPERVISE_HAIKU_EVERY iterations. Catches
# stale tasks the shell version misses (test already exists in a test file
# under a different name; deliverable equivalent to existing code). Costs
# ~$0.15/pass. Budget-capped. Existing revert guards constrain it to
# docs/loop-backlog.md only.
# ---------------------------------------------------------------------------
run_supervisor_haiku() {
  local n="$1"
  if [[ ! -f "$SUPERVISE_PROMPT_FILE" ]]; then
    log "  supervisor-haiku: prompt file missing — skipping"
    return 0
  fi

  log "  → supervisor-haiku (Claude $SUPERVISE_MODEL, after iter $n, budget \$$SUPERVISE_BUDGET_USD)"
  local pre_head
  pre_head=$(git -C "$REPO" rev-parse HEAD)

  local sup_log="$LOG_DIR/supervise-$STAMP-$(printf '%03d' "$n").log"
  local prompt
  prompt=$(cat "$SUPERVISE_PROMPT_FILE")

  cd "$REPO"
  gtimeout "$SUPERVISE_TIMEOUT" claude -p \
    --model "$SUPERVISE_MODEL" \
    --max-budget-usd "$SUPERVISE_BUDGET_USD" \
    --dangerously-skip-permissions \
    --output-format text \
    "$prompt" > "$sup_log" 2>&1 \
    || log "  supervisor: claude exited non-zero (continuing)"

  # Revert any uncommitted non-backlog changes the supervisor made.
  local dirty_bad
  dirty_bad=$(git -C "$REPO" status --porcelain \
    | awk '{print $2}' \
    | grep -v '^docs/loop-backlog\.md$' \
    | grep -v '^\.claude/' \
    || true)
  if [[ -n "$dirty_bad" ]]; then
    log "  ⚠ supervisor touched non-backlog files (uncommitted): reverting"
    git -C "$REPO" checkout -- . 2>/dev/null || true
    git -C "$REPO" clean -fd packages/ apps/ scripts/ 2>/dev/null || true
  fi

  # Revert any committed changes that touched files outside docs/loop-backlog.md.
  local post_head
  post_head=$(git -C "$REPO" rev-parse HEAD)
  if [[ "$post_head" != "$pre_head" ]]; then
    local commit_bad
    commit_bad=$(git -C "$REPO" diff --name-only "$pre_head" "$post_head" \
      | grep -v '^docs/loop-backlog\.md$' \
      || true)
    if [[ -n "$commit_bad" ]]; then
      log "  ⚠ supervisor commit touched non-backlog files — resetting to pre-supervisor HEAD"
      git -C "$REPO" reset --hard "$pre_head" >/dev/null
    else
      local summary
      summary=$(grep -oE 'SUPERVISE: .*' "$sup_log" | tail -1 || echo 'SUPERVISE: (no marker)')
      log "  ✓ $summary"
    fi
  else
    local summary
    summary=$(grep -oE 'SUPERVISE: .*' "$sup_log" | tail -1 || echo 'SUPERVISE: (no marker)')
    log "  supervisor: no changes — $summary"
  fi

  push_if_ahead "supervisor"
}

# ---------------------------------------------------------------------------
# Iteration
# ---------------------------------------------------------------------------
run_iteration() {
  local n="$1"
  log "========================================"
  log "  ITERATION $n"
  log "========================================"

  local snap
  snap=$(git -C "$REPO" rev-parse HEAD)
  log "  snapshot: $snap"

  local prompt
  prompt=$(cat "$PROMPT_FILE")

  # Recent ledger only (last 40 entries) so the model doesn't redo done work
  prompt+=$'\n\n## Recent ledger (DONE — do not redo)\n\n'
  prompt+="$(tail -40 "$REPO/docs/loop-ledger.md" 2>/dev/null || echo '(empty)')"

  git -C "$REPO" pull --ff-only origin main >/dev/null 2>&1 || true

  cd "$REPO"
  local iter_log="$LOG_DIR/iter-$STAMP-$(printf '%03d' "$n").log"

  if [[ $DEBUG -eq 1 ]]; then
    gtimeout "$ITER_TIMEOUT" opencode run -m "$MODEL" --print-logs "$prompt" 2>&1 | tee "$iter_log" | tee -a "$LOG" || true
  else
    gtimeout "$ITER_TIMEOUT" opencode run -m "$MODEL" "$prompt" > "$iter_log" 2>&1 || true
  fi
  log "  opencode exited (timeout=${ITER_TIMEOUT}s)"

  # Verify
  log "  verifying..."
  local current
  current=$(git -C "$REPO" rev-parse HEAD)

  local typecheck_ok=0
  local tests_ok=0
  (cd "$REPO" && bun typecheck) >/dev/null 2>&1 && typecheck_ok=1 || true
  (cd "$REPO" && bun test)      >/dev/null 2>&1 && tests_ok=1     || true

  # Require the iteration's diff to touch something real
  local real_diff=0
  if [[ "$current" != "$snap" ]]; then
    if git -C "$REPO" diff --name-only "$snap" "$current" \
        | grep -E '^(packages/|apps/|scripts/|docs/loop-ledger\.md|fixtures/)' >/dev/null; then
      real_diff=1
    fi
  fi

  # Extract CHOSEN TASK once — used by both success and failure paths.
  local chosen
  chosen=$(grep -oE 'CHOSEN TASK:.*' "$iter_log" | tail -1 | sed 's/CHOSEN TASK: *//')

  # Detect the case where the model picked an already-done task. Even if
  # typecheck + tests pass, a [x] pick means the model wasted its slot on
  # a no-op — fail the iteration so it's logged and we move on.
  local already_done=0
  if [[ -n "$chosen" ]]; then
    check_chosen_marker "$chosen"
    case $? in
      1) already_done=1 ;;  # was [x]
      2) already_done=1 ;;  # was [Q] — also shouldn't have been picked
    esac
  fi

  if [[ $typecheck_ok -eq 1 && $tests_ok -eq 1 && $real_diff -eq 1 && $already_done -eq 0 ]]; then
    local done_line
    done_line=$(grep -oE 'DONE: .+' "$iter_log" | tail -1 || echo 'DONE: (no marker)')
    log_fixed "$(date -u +%Y-%m-%dT%H:%M:%SZ) | $current | $done_line"
    log "  ✓ iteration succeeded — $done_line"
    CONSECUTIVE_FAILS=0
    LAST_CHOSEN="$chosen"
    # Push immediately so work doesn't sit unpushed until the next supervisor.
    push_if_ahead "iter $n success"
  else
    local fail_reason="typecheck=$typecheck_ok tests=$tests_ok real_diff=$real_diff"
    [[ $already_done -eq 1 ]] && fail_reason="$fail_reason already_done=1"
    log "  ✗ iteration failed ($fail_reason) — reverting"
    git -C "$REPO" reset --hard "$snap" >/dev/null
    git -C "$REPO" clean -fd packages/ apps/ fixtures/ 2>/dev/null || true

    # Quarantine the picked task. Reasons (in priority order):
    #   - already-done pick: model ignored the [x]/[Q] marker — DON'T
    #     touch the line (it's already correctly marked); just log.
    #   - same task picked twice consecutively after a fail: stuck on it
    #   - generic single-iter failure
    if [[ -n "$chosen" && $already_done -eq 1 ]]; then
      log "  ↪ model picked an already-marked task — no quarantine needed"
    elif [[ -n "$chosen" ]]; then
      local q_reason="failed iter $n"
      if [[ -n "$LAST_CHOSEN" ]] && [[ "$LAST_CHOSEN" == "$chosen" ]]; then
        q_reason="2 consecutive picks failed (iters $((n-1)),$n)"
      fi
      quarantine_task "$chosen" "$q_reason" || true
    fi

    if ! git -C "$REPO" diff --quiet docs/loop-backlog.md 2>/dev/null; then
      git -C "$REPO" add docs/loop-backlog.md
      git -C "$REPO" commit -m "chore: quarantine failed task from iter $n" --quiet 2>/dev/null || true
    fi

    log_fixed "$(date -u +%Y-%m-%dT%H:%M:%SZ) | $snap | REVERTED: iter $n failed ($fail_reason)"
    CONSECUTIVE_FAILS=$(( CONSECUTIVE_FAILS + 1 ))
    LAST_CHOSEN="$chosen"

    # After $STUCK_THRESHOLD consecutive fails, the most recent failing
    # task is force-quarantined (above) and we reset the counter. We no
    # longer inject hand-written "recovery" tasks — they were all for
    # symbols that already exist, so they wasted iterations.
    if [[ $CONSECUTIVE_FAILS -ge $STUCK_THRESHOLD ]]; then
      log "  ⚠ STUCK: $CONSECUTIVE_FAILS consecutive fails — relying on quarantine, resetting counter"
      CONSECUTIVE_FAILS=0
    fi
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
preflight

log "Starting overlay loop"
log "  model           = $MODEL"
log "  max iters       = $MAX_ITERS"
log "  max time        = ${MAX_TIME_HOURS}h"
log "  sleep           = ${SLEEP_BETWEEN}s"
log "  stuck threshold = $STUCK_THRESHOLD"
log "  supervise (shell) every  = $SUPERVISE_EVERY iters"
log "  supervise (haiku) every  = $SUPERVISE_HAIKU_EVERY iters (budget \$$SUPERVISE_BUDGET_USD)"
log "  log             = $LOG"
log "  fixed log       = $FIXED_LOG"

caffeinate -d -i -s &
CAFFEINATE_PID=$!
trap "kill $CAFFEINATE_PID 2>/dev/null" EXIT

STOP_FILE="$REPO/.loop-stop"
rm -f "$STOP_FILE"
log "  stop file       = $STOP_FILE (touch to stop after current iteration)"

START_TS=$(date +%s)
DEADLINE=$(( START_TS + MAX_TIME_HOURS * 3600 ))
CONSECUTIVE_FAILS=0

for ((i=1; i<=MAX_ITERS; i++)); do
  if [[ -f "$STOP_FILE" ]]; then
    log "Stop file detected — exiting after $((i-1)) iterations."
    rm -f "$STOP_FILE"
    break
  fi
  if [[ $(date +%s) -ge $DEADLINE ]]; then
    log "Hit max-time deadline after $((i-1)) iterations."
    break
  fi
  run_iteration "$i" || log "  (run_iteration error swallowed; continuing)"

  if (( i % SUPERVISE_EVERY == 0 )); then
    run_supervisor_shell "$i" || log "  (supervisor-shell error swallowed; continuing)"
  fi

  if (( i % SUPERVISE_HAIKU_EVERY == 0 )); then
    run_supervisor_haiku "$i" || log "  (supervisor-haiku error swallowed; continuing)"
  fi

  if (( i < MAX_ITERS )); then
    [[ -f "$STOP_FILE" ]] && { log "Stop file detected after iter $i."; rm -f "$STOP_FILE"; break; }
    log "  sleeping ${SLEEP_BETWEEN}s..."
    sleep "$SLEEP_BETWEEN"
  fi
done

log "Loop complete."
[[ -f "$FIXED_LOG" ]] && tail -50 "$FIXED_LOG" | tee -a "$LOG" || log "  (no fixed log)"
