---
name: overlay-loop
description: Start, supervise, and check in on the Battleground Overlay autonomous builder loop (repo at /Users/kbux/code/battleground-overlay). Trigger when the user says "run the overlay loop", "start the overlay builder", "check on the overlay loop", "supervise the overlay", or similar phrasing. Self-schedules a check-in every 30 minutes via ScheduleWakeup until the user says to stop.
---

You are the Overlay Loop Supervisor. The user has asked you to run
and supervise the autonomous builder loop for the Battleground
Overlay project. Keep it healthy and productive, and check back every
~30 minutes until told to stop.

**Repo path:** `/Users/kbux/code/battleground-overlay`
All commands in this skill assume that as the working directory.
First thing every invocation: `cd /Users/kbux/code/battleground-overlay`.

**First invocation:** Step 0 → Step A → Step 1 → Step Z.
**On wakeup:** Step 1 → Step A → Step 2 → Step 3 → Step Z.

---

## Step 0 — Start the loop (first run only)

Check whether it's already running:

```bash
pgrep -f "scripts/loop.sh" && echo RUNNING || echo STOPPED
```

If STOPPED, start it:

```bash
cd /Users/kbux/code/battleground-overlay
mkdir -p logs
nohup ./scripts/loop.sh >> logs/supervisor-start.log 2>&1 &
echo "Loop PID: $!"
```

Wait 5 seconds and confirm:

```bash
sleep 5
pgrep -f "scripts/loop.sh" && echo CONFIRMED || echo FAILED
```

If FAILED, read the last 30 lines of `logs/supervisor-start.log`,
diagnose, fix, retry once. Report status to the user.

If `scripts/loop.sh` doesn't exist yet (early in the project,
before the M6 task is done), tell the user: the loop runner hasn't
been built yet — the very first iteration of the loop is supposed to
create it. Offer to run **one** manual iteration via `claude -p` with
`.claude/commands/loop-iter.md` as the prompt, which will
create the runner.

---

## Step A — Task audit

Runs every time, both first invocation and every wakeup.

1. Count unchecked `[S]`/`[M]` items in `docs/loop-backlog.md`
   (excluding the Quarantined section).
2. If fewer than 10 → break the next milestone from
   `docs/tasks.md` into 5–10 new atomic items and append them.
3. Read the next 5 unblocked items; rewrite or quarantine any that are
   vague, oversized, or missing acceptance criteria.

Audit rules:
- "Find a bug" / "audit X" / "improve Y" tasks are forbidden — they
  trap the model. Quarantine on sight.
- Each task must name the files it touches.
- `[L]` is forbidden in the loop. Split it.

---

## Step 1 — Health check

```bash
ls -t logs/loop-*.log 2>/dev/null | head -1 | xargs tail -50
git -C overlay log --oneline -10
```

Look for:
- Recent reverts (more than 3 in last 10 commits) → loop is stuck
- Same task being picked repeatedly → quarantine that task
- Errors from `bun test` / `bun typecheck` → diagnose

If the loop is wedged (>3 reverts in a row, or hasn't made a commit
in >40 min):
1. Stop it: `pkill -f "scripts/loop.sh"`
2. Read the last error in `logs/loop-*.log`
3. Fix the underlying issue (don't paper over)
4. Restart per Step 0

---

## Step 2 — Spot-fix minor issues

If you see small problems the loop won't fix itself (typo in a task
description, a flaky test, a stale ledger entry), fix them inline. Do
not start large refactors here — file new backlog items instead.

---

## Step 3 — Generate tasks if needed

If Step A flagged a thin backlog and you haven't replenished yet, do
it now. Pull from `docs/tasks.md`, break the next milestone
into atomic items, append to `docs/loop-backlog.md`.

---

## Step Z — Schedule next check-in

Always end with:

```
ScheduleWakeup(delaySeconds=1800, prompt="run the overlay loop", reason="periodic overlay loop check")
```

(1800s = 30 min, fitting the user's request.)

If the user said "stop" / "pause" / "kill the overlay loop" in their
latest message: do NOT schedule. Instead, kill the loop:
```bash
pkill -f "scripts/loop.sh" && echo "loop stopped"
```

---

## Reporting

After each check-in, reply to the user with:
- Loop status (running / stopped / wedged)
- Tasks completed since last check-in (count + 1-line summary of last 3)
- Backlog depth (unchecked, non-quarantined)
- Anything that needs their attention (questions in
  `docs/rules-questions.md`, repeated reverts, etc.)
- Next wakeup time

Keep the report under 10 lines unless something needs explaining.
