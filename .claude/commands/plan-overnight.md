---
description: Plan an overnight loop run — refresh the code inventory, decompose milestones into vetted atomic backlog tasks, commit
---

You are running the **Plan Overnight** procedure for the autonomous
builder loop. The goal: produce ~60 vetted `[S]` tasks that the loop
can chew through autonomously while the user sleeps. There is no live
supervisor (the every-3rd-iteration opencode supervisor handles
quarantine only); your batched audit is the quality bar.

**Operate only in this repo.** Repo root: the current working
directory.

## Mindset

Today's loop session showed exactly what wrecks autonomous progress:

- **Stale tasks** (claimed-missing function already exists) → `real_diff=0` revert, ~10 min wasted.
- **Vague tasks** ("audit", "improve", "find a bug") → model picks something random and either fakes work or reverts.
- **Fake BG mechanics** (Stealth, Spell Damage, Bounty) → invented tags the model dutifully implements before the test fails.
- **Bad test shape** (asserting an `object.regression` field on a function that returns a string) → unfixable without changing implementation, real_diff=0.
- **Tests requiring complex module mocking** (top-level `ipcMain.handle` side effects in `main.ts`) → endless retries.

Your job is to write tasks that **can't** fall into those traps.

## Step 0 — Confirm scope

Tell the user what you're about to do:

> Planning ~60 atomic tasks. This will take ~30–60 min depending on inventory freshness. Confirm to proceed, or override the count (default 60).

Wait for confirmation or override. Then proceed.

## Step 1 — Refresh the code inventory

Goal: `docs/code-inventory.md` reflects the current state of every
exported symbol in `packages/*/src/` and `apps/overlay/src/`.

1. If `docs/code-inventory.md` doesn't exist, do a full scan: walk
   each package/app, list every exported function/class/type with a
   one-line description and the file:line. Group by package.
2. If it does exist, diff against the current code:
   - For each section, spot-check 3 random entries (verify file:line
     still matches).
   - For each `packages/*/src/` directory, ensure all source files
     are represented. New files get appended with their exports.
   - Remove entries for files that no longer exist.
3. Add a `## Known gaps` section listing milestones from
   `docs/tasks.md` that are not yet covered by completed backlog
   items. This is your candidate pool for Step 2.

Commit the inventory if it changed: `chore(inventory): refresh code inventory`.

## Step 2 — Identify the next two milestones

Read `docs/tasks.md`. Pick the next two milestone sections with the
most unchecked items (`- [ ]`). Skip anything blocked on game-rules
questions in `docs/rules-questions.md`.

For each milestone, list 20–40 candidate decompositions in your own
notes (in this conversation, not in any file). Then audit them.

## Step 3 — Audit before writing

For each candidate task:

1. **Is the file path real?** `ls` the target. If not, the task must
   create it — fine, but note that.
2. **Does the claimed-missing symbol already exist?** `rg
   "<symbol>" packages/ apps/ scripts/`. If yes, **drop the task**.
3. **Is the test shape achievable without changing production code?**
   Pull up the target function and verify your assertion matches
   reality (signature, return type, output format). If you'd be
   asserting against a string but called it a "field", you got it
   wrong — fix or drop.
4. **Vague verbs?** Reject anything starting with audit, improve,
   review, refactor, find, investigate.
5. **Game-rules invention?** If the task names a Hearthstone tag or
   mechanic, confirm against `packages/state/src/reducer.ts` (which
   has the real tag allowlist) before writing.
6. **`[L]`-sized?** Split it. The loop can't handle multi-file
   refactors.

Drop ~30–40% of candidates here. That's normal.

## Step 4 — Write the tasks

Append to `docs/loop-backlog.md` under new `## M<N>` sections
following the format of M40/M41 (already in the file).

**Hard format rules for every task:**

- Starts with `- [ ] [S]` followed by a short title and `—`.
- Names the **specific file paths** it touches (production and test).
- Specifies the **exact symbol/function signature** to add or modify.
- Specifies the **exact test count and a one-line summary of each
  test's assertion**.
- Ends with the file paths repeated: `— <prod-path> + <test-path>`.

Bad: `- [ ] [S] Improve error handling in cardLoader`

Good: `- [ ] [S] cardLoader missing-file fallback — in
\`packages/card-data/src/loadCards.ts\`, if the JSON file at the
configured path doesn't exist, return \`[]\` instead of throwing;
1 test in \`loadCards.test.ts\`: \`loadCards('/tmp/nonexistent.json')\`
returns \`[]\` without throwing — \`packages/card-data/src/loadCards.ts\`
+ test`

**Order tasks** so that any dependencies come first (rare in `[S]`
tasks — most should be independent).

**Oversize the backlog**: aim for 60 even if you think 50 is enough.
The loop runs faster than you'd predict, and idle = wasted night.

## Step 5 — Commit

Single commit:

```
git add docs/loop-backlog.md docs/code-inventory.md
git commit -m "chore: plan overnight run — <N> tasks across M<X>..M<Y>"
```

Do not push. The user will start the loop manually after reviewing.

## Step 6 — Hand-off summary

Print to the user:

```
Planned <N> tasks:
  M<X> — <theme> (<count> tasks)
  M<Y> — <theme> (<count> tasks)

Audited <C> candidates total, dropped <D> for: <reasons>.
Inventory refreshed: <yes|no, N entries changed>.

To start: ./scripts/loop.sh
To stop:  touch .loop-stop
```
