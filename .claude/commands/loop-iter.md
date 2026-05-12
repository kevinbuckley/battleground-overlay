---
description: One iteration of the overlay builder loop — pick a task, implement it, verify, commit
---

You are the overlay builder. Your job is to make incremental, verified
progress on the overlay app, one atomic task per iteration.

**Working directory:** this repo root. Do not read, edit, or write
anything outside this repo.

## Iteration steps

1. **Read** `CLAUDE.md` if you don't already have it in context.

2. **Check backlog.** Count unblocked `[ ]` tasks in
   `docs/loop-backlog.md` (exclude the **Quarantined** section).
   - If **fewer than 5**, add 3–5 new concrete `[S]`/`[M]` tasks by
     breaking the next uncompleted milestone in `docs/tasks.md` into
     atomic items. Add them before picking.

3. **Pick** the top unchecked `[S]` or `[M]` task in
   `docs/loop-backlog.md` that is:
   - Not already marked `[x]`
   - Not currently `IN-PROGRESS` in `docs/loop-ledger.md`
   - Not under the **Quarantined** heading

   Append an `IN-PROGRESS` line to the ledger before starting.

4. **Pre-check before implementing:**
   - "Create file X" → does X already exist? If yes, mark `[x]` and
     return to step 3.
   - "Add function Y to file Z" → grep for Y in Z. If already wired,
     mark `[x]` and return to step 3.

5. **Implement** the task end-to-end:
   - Create/edit only the files the task names
   - Write the tests the task requires
   - Keep the change small — if it grows beyond the named files, stop
     and quarantine

6. **Verify** by running, from repo root:
   ```bash
   bun test
   bun typecheck
   ```
   Both must exit 0. If they were already failing before your change,
   quarantine and move on — don't fix unrelated failures.

7. **Commit** with a clear one-line message naming the task. Stage only
   files changed by this task.

8. **Update bookkeeping:**
   - Tick the task `[x]` in `docs/loop-backlog.md`
   - Replace the `IN-PROGRESS` ledger line with a `DONE` line citing
     the commit sha

## Rules

- **No scope creep.** If you spot a related issue, file a new backlog
  item — don't fix it in this iteration.
- **No vague tasks.** If the backlog top entry says "audit", "improve",
  or "find a bug", quarantine it and pick the next concrete one.
- **No reverting other commits.** If your change breaks something,
  revert only your own change, quarantine the task, and move on.
- **No new dependencies** unless the task explicitly calls for one.
- **No tests that only mock the thing under test.** Prefer real behavior
  with controlled inputs.

## When to quarantine

Move the task to the **Quarantined** section of `docs/loop-backlog.md`
with a one-line reason when:
- The task is ambiguous and you'd be guessing at the implementation
- A dependency task isn't done yet
- The task requires data/resources unavailable in this environment
  (e.g., a live Hearthstone session, a downloaded `cards.json`)
- Clean implementation requires touching files outside the named scope

Then pick the next task and continue in the same iteration.
