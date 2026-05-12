# Overlay architecture

## Goal

Real-time advice for live Battlegrounds on Mac. Latency budget: **3
seconds** from "shop refreshed" to "advice rendered." Personal-use,
no shipping, but built to a real-app quality bar.

## Data flow

```
                ┌────────────────────────────────────────────┐
                │  Hearthstone (Battle.net Mac client)       │
                │  writes ~/Library/Logs/Blizzard/.../Power.log
                └─────────────────┬──────────────────────────┘
                                  │ tail -f
                                  ▼
              ┌─────────────────────────────────┐
              │  packages/log-parser            │
              │  raw lines → typed HsEvent[]    │
              └─────────────────┬───────────────┘
                                ▼
              ┌─────────────────────────────────┐
              │  packages/state                 │
              │  HsEvent[] → GameState          │
              │  (live, partial-info)           │
              └─────────────────┬───────────────┘
                                ▼
              ┌─────────────────────────────────┐
              │  packages/advisor               │
              │  ┌──────────┐  ┌──────────────┐ │
              │  │heuristics│→│sim search    │ │
              │  └──────────┘  └──────────────┘ │
              │             ↓                   │
              │       Recommendation[]          │
              └─────────────────┬───────────────┘
                                ▼
              ┌─────────────────────────────────┐
              │  apps/overlay (Electron)        │
              │  transparent click-through win  │
              └─────────────────────────────────┘
                                ▲
                                │ optional, on hover/low-conf
                                │
              ┌─────────────────┴───────────────┐
              │  packages/llm                   │
              │  → http://localhost:8080 (MLX)  │
              │  "explain this advice"          │
              └─────────────────────────────────┘
```

## Packages

### `log-parser`

- Watches the newest `~/Library/Logs/Blizzard/Hearthstone/Logs/Hearthstone_*/Power.log`
  directory (Hearthstone creates a new one per launch).
- Streams new lines via `chokidar` or `fs.watch`.
- Parses `TAG_CHANGE`, `FULL_ENTITY`, `SHOW_ENTITY`, `ZoneChangeList`,
  `BLOCK_START/END` into discriminated-union events.
- Pure transform: same byte stream → same event stream, no side effects.

### `state`

- Reducer: `applyEvent(state, event) → state`.
- Tracks:
  - **Player**: hero, hp, armor, gold, max gold, tier, hand, board,
    shop, frozen state, triples-in-progress.
  - **Opponents** (7): hero, hp, last-seen-board (with timestamp), last
    combat damage dealt/taken.
  - **Lobby**: turn number, tribes-in-play, anomaly, available trinkets.
- Emits `StateChange` deltas the UI can subscribe to.
- 100% replay-testable against recorded fixtures.

### `card-data`

- Loads HearthstoneJSON dump, pinned by patch hash in
  `card-data/PATCH.txt`.
- Indexes by `dbfId` (what the log uses) and `id` (string id).
- Exposes `getCard(dbfId)`, `isBattlegroundsPool(card)`, tribe lookup,
  tier lookup.

### `sim`

- Thin wrapper around `@firestone-hs/simulate-bgs-battle`.
- Converts our `Board` → their input format, calls their simulator,
  converts transcripts back.
- Provides `simulateBatch(playerBoard, opponentBoards, n) → {wins,
  losses, ties, avgDamageDealt, avgDamageTaken}`.
- Deterministic given a seed.

### `advisor`

The brain. Given a `GameState`, returns `Recommendation[]` sorted by
expected value.

**Heuristic layer** (`advisor/heuristics/`):
- Tier curve (when to upgrade given turn/HP/gold)
- Triple detection
- Tribe synergy scoring
- "Don't sell your only X" guards
- Power-tier pivot signals (e.g. "demons are falling off, consider quilboars")

**Simulation search** (`advisor/search/`):
- Enumerate candidate actions (buy/sell/position combos)
- Prune by heuristic score, keep top K
- For each candidate, sample N=200 plausible opponent boards
  (last-seen + projected tier-up + archetype prior)
- Score: expected HP delta × position weight
- Hill-climb position from heuristic seed: swap-and-resim until convergence

**Budget enforcement**: 3-second wall clock split across candidates.
Work happens in a worker thread so the UI never blocks.

### `llm`

- OpenAI-compatible client pointed at `http://localhost:8080`.
- Functions: `explainRecommendation(state, rec) → string`,
  `lowConfidenceEscape(state, topRecs) → Recommendation`.
- Caches by `hash(state) + hash(rec)` so identical situations don't
  re-prompt.
- **Never** called in the hot path. Always async, never blocking.

### `apps/overlay`

- Electron 28+, transparent window, `alwaysOnTop`,
  `setIgnoreMouseEvents(true, { forward: true })` with selective
  click-through.
- Anchored to Hearthstone window position (uses macOS Accessibility
  API or pixel-based detection).
- Panels:
  - **Advice panel** — current top recommendation + "why?" expand
  - **Board panel** — recommended positioning overlay
  - **Opponent panel** — projected scaling per opponent
  - **Damage forecast** — expected damage this combat
- Hotkeys: cmd+shift+H toggle, cmd+shift+R reload card data.

### `apps/replay`

- Loads a fixture `.log` file.
- Scrubber UI: step through events, see state at each tick.
- Side-by-side advisor recommendation vs. what the user actually did.
- Used for: debugging the parser, validating advisor changes,
  post-game review.

## Determinism guarantees

- `log-parser`: pure transform, fully tested with fixture files.
- `state`: pure reducer, replay tests assert end-state per fixture.
- `sim`: deterministic given seed (upstream guarantee).
- `advisor`: deterministic given state + seed.
- `llm`: **non-deterministic, isolated to explanation path only.**

If a non-LLM test is flaky, it's a bug. Fix the bug, don't retry.

## Patch update workflow

When a new Battlegrounds patch lands:

1. Run `bun run scripts/bump-patch.ts`
2. Pulls latest HearthstoneJSON
3. Pulls latest `@firestone-hs/simulate-bgs-battle`
4. Re-runs the full sim test suite
5. Flags any test deltas for human review
6. Updates `card-data/PATCH.txt`

## What the overlay does NOT do

- **Take actions for you.** Read-only. You click the buttons.
- **Read game memory.** Logs only. TOS-safe.
- **Phone home.** All compute is local (sim local, LLM local).
- **Track multiple accounts.** Single-user, single-machine.
