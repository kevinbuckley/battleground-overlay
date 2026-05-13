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

LOG_DIR="$REPO/logs"
mkdir -p "$LOG_DIR"
STAMP=$(date +%Y%m%d-%H%M)
LOG="$LOG_DIR/loop-$STAMP.log"
FIXED_LOG="$LOG_DIR/fixed-$STAMP.log"

MAX_ITERS=999
SLEEP_BETWEEN=20
MAX_TIME_HOURS=12
DEBUG=0
ITER_TIMEOUT=600
STUCK_THRESHOLD=3
SUPERVISE_EVERY=3
SUPERVISE_TIMEOUT=180

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
inject_recovery_task() {
  local count="$1"
  log "  ⚠ STUCK: $count consecutive fails — injecting a recovery task"
  local fallbacks=(
    "- [ ] [S] RECOVERY: Add \`clamp(n: number, min: number, max: number): number\` to \`packages/shared/src/utils.ts\` and export from shared index; test: clamp(5,1,3)===3, clamp(0,1,3)===1, clamp(2,1,3)===2 — packages/shared/src/utils.ts + test"
    "- [ ] [S] RECOVERY: Add \`isShoppingPhase(state: GameState): boolean\` to \`packages/shared/src/utils.ts\` returning state.phase==='shopping'; test two cases — packages/shared/src/utils.ts update + test"
    "- [ ] [S] RECOVERY: Add \`hpBucket(hp: number): 'critical'|'low'|'safe'\` to \`packages/shared/src/utils.ts\` (critical<6, low<15, safe otherwise); 3 tests — packages/shared/src/utils.ts update + test"
    "- [ ] [S] RECOVERY: Add \`parseLine(line: string): HsEvent | null\` to \`packages/log-parser/src/parseLine.ts\` that tries each parser in order and returns the first non-null; test with a TAG_CHANGE line and a garbage line — packages/log-parser/src/parseLine.ts + test"
    "- [ ] [S] RECOVERY: Add \`formatRecommendation(rec: Recommendation): string\` to \`packages/shared/src/utils.ts\` returning a short human-readable string like 'Buy Murloc Tidecaller (score: 0.8)'; test one Buy and one TierUp — packages/shared/src/utils.ts update + test"
  )
  local idx=$(( CONSECUTIVE_FAILS_TOTAL % ${#fallbacks[@]} ))
  local next_task="${fallbacks[$idx]}"
  CONSECUTIVE_FAILS_TOTAL=$(( CONSECUTIVE_FAILS_TOTAL + 1 ))

  # Insert just before the Quarantined section (or at end of file) so it gets
  # picked in the next iteration without burying it in all-done M0 tasks.
  if grep -q "^## Quarantined" "$REPO/docs/loop-backlog.md"; then
    awk -v task="$next_task" '
      /^## Quarantined/ && !done { print task; print ""; done=1 }
      { print }
    ' "$REPO/docs/loop-backlog.md" > "$REPO/docs/loop-backlog.md.tmp" \
      && mv "$REPO/docs/loop-backlog.md.tmp" "$REPO/docs/loop-backlog.md"
  else
    printf '\n%s\n' "$next_task" >> "$REPO/docs/loop-backlog.md"
  fi
  log "  → Recovery task injected: $next_task"
}

# ---------------------------------------------------------------------------
# Supervisor — runs every $SUPERVISE_EVERY iterations. Constrained to
# only touch docs/loop-backlog.md; the guard below reverts anything else.
# ---------------------------------------------------------------------------
run_supervisor() {
  local n="$1"
  if [[ ! -f "$SUPERVISE_PROMPT_FILE" ]]; then
    log "  supervisor: prompt file missing — skipping"
    return 0
  fi

  log "  → supervisor pass (after iter $n)"
  local pre_head
  pre_head=$(git -C "$REPO" rev-parse HEAD)

  local sup_log="$LOG_DIR/supervise-$STAMP-$(printf '%03d' "$n").log"
  local prompt
  prompt=$(cat "$SUPERVISE_PROMPT_FILE")

  cd "$REPO"
  gtimeout "$SUPERVISE_TIMEOUT" opencode run -m "$MODEL" "$prompt" \
    > "$sup_log" 2>&1 || log "  supervisor: opencode exited non-zero (continuing)"

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
    log "  supervisor: no changes"
  fi

  # Push all accumulated commits (iteration + supervisor) to origin every
  # supervisor pass. Skips silently if nothing to push or the push fails
  # (e.g. no network — next pass will retry).
  local ahead
  ahead=$(git -C "$REPO" rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)
  if [[ "$ahead" -gt 0 ]]; then
    if git -C "$REPO" push origin main >>"$LOG" 2>&1; then
      log "  ↑ pushed $ahead commit(s) to origin/main"
    else
      log "  ⚠ push failed (will retry next supervisor pass)"
    fi
  fi
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

  if [[ $typecheck_ok -eq 1 && $tests_ok -eq 1 && $real_diff -eq 1 ]]; then
    local done_line
    done_line=$(grep -oE 'DONE: .+' "$iter_log" | tail -1 || echo 'DONE: (no marker)')
    log_fixed "$(date -u +%Y-%m-%dT%H:%M:%SZ) | $current | $done_line"
    log "  ✓ iteration succeeded — $done_line"
    CONSECUTIVE_FAILS=0
  else
    log "  ✗ iteration failed (typecheck=$typecheck_ok tests=$tests_ok real_diff=$real_diff) — reverting"
    git -C "$REPO" reset --hard "$snap" >/dev/null
    git -C "$REPO" clean -fd packages/ apps/ fixtures/ 2>/dev/null || true

    # Quarantine the picked task
    local chosen
    chosen=$(grep -oE 'CHOSEN TASK:.*' "$iter_log" | tail -1 | sed 's/CHOSEN TASK: *//')
    if [[ -n "$chosen" ]]; then
      local key
      key=$(echo "$chosen" | head -c 50 | sed 's/[][().*+?^$\\/]/\\&/g')
      if grep -qF "$key" "$REPO/docs/loop-backlog.md" 2>/dev/null; then
        if ! grep -q "^## Quarantined" "$REPO/docs/loop-backlog.md"; then
          printf '\n---\n\n## Quarantined (failed — DO NOT pick)\n\n' \
            >> "$REPO/docs/loop-backlog.md"
        fi
        local lineno
        lineno=$(grep -nF "$key" "$REPO/docs/loop-backlog.md" | head -1 | cut -d: -f1)
        if [[ -n "$lineno" ]]; then
          local existing
          existing=$(sed -n "${lineno}p" "$REPO/docs/loop-backlog.md")
          if [[ "$existing" =~ ^-\ \[[\ x]\] ]]; then
            sed -i '' "${lineno}d" "$REPO/docs/loop-backlog.md"
            echo "$existing  <!-- failed iter $n -->" >> "$REPO/docs/loop-backlog.md"
            log "  ↪ Quarantined: $(echo "$chosen" | head -c 80)"
          fi
        fi
      fi
    fi

    if ! git -C "$REPO" diff --quiet docs/loop-backlog.md 2>/dev/null; then
      git -C "$REPO" add docs/loop-backlog.md
      git -C "$REPO" commit -m "chore: quarantine failed task from iter $n" --quiet 2>/dev/null || true
    fi

    log_fixed "$(date -u +%Y-%m-%dT%H:%M:%SZ) | $snap | REVERTED: iter $n failed"
    CONSECUTIVE_FAILS=$(( CONSECUTIVE_FAILS + 1 ))

    if [[ $CONSECUTIVE_FAILS -ge $STUCK_THRESHOLD ]]; then
      inject_recovery_task "$CONSECUTIVE_FAILS"
      if ! git -C "$REPO" diff --quiet docs/loop-backlog.md 2>/dev/null; then
        git -C "$REPO" add docs/loop-backlog.md
        git -C "$REPO" commit -m "chore: inject recovery task after $CONSECUTIVE_FAILS fails" --quiet 2>/dev/null || true
      fi
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
log "  supervise every = $SUPERVISE_EVERY iters"
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
CONSECUTIVE_FAILS_TOTAL=0

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
    run_supervisor "$i" || log "  (run_supervisor error swallowed; continuing)"
  fi

  if (( i < MAX_ITERS )); then
    [[ -f "$STOP_FILE" ]] && { log "Stop file detected after iter $i."; rm -f "$STOP_FILE"; break; }
    log "  sleeping ${SLEEP_BETWEEN}s..."
    sleep "$SLEEP_BETWEEN"
  fi
done

log "Loop complete."
[[ -f "$FIXED_LOG" ]] && tail -50 "$FIXED_LOG" | tee -a "$LOG" || log "  (no fixed log)"
