# Battlegrounds Overlay

A real-time advice overlay for **live Hearthstone Battlegrounds** played
on the Battle.net Mac client. Reads the game's `Power.log`, builds a
live game-state model, runs simulation + heuristic search, and renders
prescriptive advice (buy/sell/freeze/reroll/tier/position) on a
transparent always-on-top window.

**This app is fully self-contained in this repo.** Everything —
source, tests, fixtures, docs, scripts, agent config, loop runner,
logs — lives under this directory. Do not read from or write to
paths outside this repo.

## Read this first

- **Tasks (strategic milestones):** [docs/tasks.md](docs/tasks.md)
- **Loop backlog (atomic, one-shot tasks):** [docs/loop-backlog.md](docs/loop-backlog.md)
- **Loop ledger (in-flight + completed):** [docs/loop-ledger.md](docs/loop-ledger.md)
- **Architecture:** [docs/architecture.md](docs/architecture.md)

When picking work: read `docs/loop-backlog.md`, pick the top unblocked
`[S]` or `[M]` task NOT already in `loop-ledger.md` and NOT in
**Quarantined**. Implement it end-to-end with tests, then mark it done
in the backlog and append a one-line entry to the ledger.

## Non-negotiable invariants

1. **State model is pure.** `packages/state` takes events in, emits
   `GameState` out. No I/O, no `Date.now`, no `Math.random`. This is
   what we replay-test against recorded log fixtures.
2. **Sim wrapper is pure.** `packages/sim` takes `(boardA, boardB, seed)`
   and returns a transcript. Determinism is enforced by tests.
3. **Advisor is testable in isolation.** Given a fixed `GameState`,
   the advisor returns the same recommendations. The LLM layer
   (`packages/llm`) is **never** in the deterministic path — it only
   produces explanations.
4. **Use upstream packages, don't reinvent.**
   - Combat sim: `@firestone-hs/simulate-bgs-battle` (full current-patch coverage)
   - Card data: HearthstoneJSON, pinned by patch hash
   - Log parsing: write our own (referencing Firestone's parser) since we
     need a clean state model anyway
5. **One package per concern.** No god-packages. If two packages need
   the same type, it goes in `packages/shared`.
6. **Never merge without tests green.** `bun test` and `bun typecheck`
   gate every change.

## Directory map

```
battleground-overlay/
├── apps/
│   ├── overlay/            Electron transparent overlay (the UI)
│   └── replay/             Dev tool: scrub through a recorded log
├── packages/
│   ├── log-parser/         Tail Power.log → typed event stream
│   ├── state/              Event stream → live GameState
│   ├── card-data/          HearthstoneJSON loader, patch-pinned
│   ├── sim/                Wraps @firestone-hs/simulate-bgs-battle
│   ├── advisor/            Heuristics + simulation search
│   ├── llm/                Local Qwen client (MLX, port 8080)
│   └── shared/             Cross-package types
├── fixtures/               Recorded Power.log files for offline tests
├── scripts/                Loop runner, setup, log-config writer
├── logs/                   Session JSONL logs + loop logs (gitignored)
├── docs/
│   ├── architecture.md
│   ├── tasks.md            Strategic milestones
│   ├── loop-backlog.md     Atomic loop tasks
│   ├── loop-ledger.md      In-flight + done
│   └── rules-questions.md  Open questions for the human
├── .claude/
│   ├── agents/             Overlay-specific subagents
│   ├── commands/           Overlay-specific slash commands
│   └── settings.json       Permissions/hooks scoped to this repo
└── CLAUDE.md               This file
```

## LLM endpoint

Qwen3.6-35B-A3B-4bit (MoE, 3.6B active) runs locally at
`http://localhost:8080/v1/chat/completions` (OpenAI-compatible).
The overlay calls it for explanations only — never in the hot path,
never for combinatorial decisions.

## Logging for review

All overlay sessions write a JSONL log to
`logs/session-<timestamp>.jsonl` containing: parsed events,
state snapshots per turn, advice produced, sim results, and (if any)
LLM round-trips. These logs are how you do "what should I have done
on turn 8" post-game reviews with Claude later.

## Commands you'll use

```bash
bun install              # install workspace deps
bun test                 # all package tests
bun typecheck            # tsc --noEmit across workspaces
bun lint                 # Biome check
bun run dev:overlay      # launch Electron overlay in dev mode
bun run dev:replay       # launch replay scrubber on a fixture
```

## When stuck

- Game rules question? Add a note to [docs/rules-questions.md](docs/rules-questions.md)
  and either ask the user or look up a primary source (Hearthstone
  wiki, official patch notes). Don't invent.
- Don't know what `TAG_CHANGE` means? Read Firestone's parser
  (github.com/Zero-to-Heroes) as a reference, then write your own.
- Don't know if Firestone has a feature? Check, don't guess.
- Stuck on a backlog task → move it to **Quarantined** in
  `docs/loop-backlog.md` with a one-line reason and pick a different
  task. Never silently abandon.
