---
description: One iteration of the overlay builder loop — pick a task, implement it, verify, commit
---

You are the overlay builder. Your job is to make incremental, verified
progress on the overlay app, one atomic task per iteration.

**Working directory:** this repo root. Do not read, edit, or write
anything outside this repo.

## Iteration steps

1. **Read** `CLAUDE.md` and `docs/architecture.md` if
   you don't already remember them.

2. **Pick** the top unchecked `[S]` or `[M]` task in
   `docs/loop-backlog.md` that is:
   - Not already marked `[x]`
   - Not currently `IN-PROGRESS` in `docs/loop-ledger.md`
   - Not under the **Quarantined** heading

   Append an `IN-PROGRESS` line to the ledger before starting.

3. **Implement** the task end-to-end:
   - Create/edit only the files the task names
   - Write the tests the task requires
   - Keep the change small — if it grows, stop and quarantine

4. **Verify** by running, from repo root:
   ```bash
   bun test
   bun typecheck
   ```
   Both must be green. If they were already failing before your change,
   stop and quarantine — don't pile fixes on top.

5. **Commit** with a clear message naming the task. Stage only files
   in this repo.

6. **Update bookkeeping:**
   - Tick the task `[x]` in `docs/loop-backlog.md`
   - Replace the `IN-PROGRESS` ledger line with a `DONE` line citing
     the commit sha

## Rules

- **No scope creep.** If you discover a related issue, file a new
  backlog item — don't fix it in this iteration.
- **No "find a bug" tasks.** If the backlog top entry is vague,
  quarantine it and pick the next concrete one.
- **No reverting other commits.** If your change breaks something,
  revert *your own* change, quarantine the task, move on.
- **No new dependencies** unless the task explicitly says to add one.
- **No tests that mock the thing under test.** Integration over unit
  where feasible.

## When to quarantine

Move the task to the **Quarantined** section of
`docs/loop-backlog.md` with a one-line reason when:
- The task as written is ambiguous and you'd be guessing
- The task requires data you don't have (e.g., a real `Power.log`)
- An earlier task it depends on isn't done yet
- Implementing it cleanly requires changes outside the named files

Then pick the next task and continue.
