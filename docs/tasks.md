# Overlay — strategic task list

Milestones are rough groupings. Within a milestone prefer small
vertical slices over broad horizontal work. Mark `[x]` when **merged
with tests green**.

The *strategic* task list (this file) is for planning. The agent that
builds the overlay should work from **`loop-backlog.md`** which has the
atomic, one-iteration-sized tasks.

---

## M0 — Bootstrap

- [ ] Bun workspace in this repo (`package.json` with `workspaces`)
- [ ] TypeScript strict + path aliases for `@overlay/*`
- [ ] Vitest configured (Bun's test runner is fine too — pick one)
- [ ] Biome config inherited from parent repo
- [ ] Empty `packages/{log-parser,state,card-data,sim,advisor,llm,shared}`
- [ ] Empty `apps/{overlay,replay}`
- [ ] `bun typecheck` and `bun test` both green on empty scaffold
- [ ] Setup script: `scripts/enable-hs-logging.sh` writes `log.config`

## M1 — Log parser

- [ ] Fixtures directory + 3 hand-recorded `Power.log` snippets
- [ ] Locate newest HS log directory (handles per-session rotation)
- [ ] Streaming line reader (file tail, no busy poll)
- [ ] `HsEvent` discriminated union type
- [ ] Parse `TAG_CHANGE`
- [ ] Parse `FULL_ENTITY` / `SHOW_ENTITY`
- [ ] Parse `ZoneChangeList`
- [ ] Parse `BLOCK_START` / `BLOCK_END` (nesting matters)
- [ ] BG-specific event extraction: shop refresh, turn start, combat start
- [ ] Test: each fixture → expected event stream

## M2 — State model

- [ ] `GameState`, `PlayerState`, `OpponentState`, `Board`, `Minion`,
      `Shop`, `Hand`, `Hero`
- [ ] `applyEvent(state, event)` reducer
- [ ] Track own gold, tier, hp, hero, hand, board, shop, frozen state
- [ ] Track opponents: hp, hero, last-seen-board with timestamp
- [ ] Track lobby: turn, tribes-in-play, anomaly
- [ ] `replayFixture(path)` helper for tests
- [ ] Snapshot tests per fixture: end state matches expectation

## M3 — Card data + sim

- [ ] HearthstoneJSON loader, patch pinned in `card-data/PATCH.txt`
- [ ] Card indexes: by `dbfId`, by `id`, by tribe, by tier
- [ ] BG pool filter (which cards exist in the BG minion pool)
- [ ] Wrap `@firestone-hs/simulate-bgs-battle`
- [ ] Adapter: our `Board` → their format and back
- [ ] `simulateBatch(playerBoard, opponentBoards, n, seed)` API
- [ ] Determinism test: same inputs + seed → identical results
- [ ] Smoke test: known matchups produce expected win-rate ballpark

## M4 — Advisor: heuristics

- [ ] Tier curve table (turn × hp → "should I tier?")
- [ ] Triple detector
- [ ] Tribe synergy scorer
- [ ] Buy candidate ranker
- [ ] Sell candidate ranker
- [ ] Freeze decision
- [ ] Reroll decision
- [ ] Output `Recommendation` type with action + reasoning + confidence

## M5 — Advisor: simulation search

- [ ] Opponent-board predictor (last-seen + tier-up projection + archetype prior)
- [ ] Candidate action enumeration + heuristic pruning
- [ ] N=200 sim batch per candidate
- [ ] Scoring function (expected HP delta × lobby weight)
- [ ] Position hill-climb (50 sims × 20 swaps)
- [ ] 3-second wall-clock budget enforcement
- [ ] Worker-thread offload so the UI never blocks
- [ ] Benchmark suite to track perf over time

## M6 — LLM layer

- [ ] OpenAI-compatible client → `http://localhost:8080`
- [ ] Prompt template: state + top-3 sim results → "explain in 1 sentence"
- [ ] State-hash cache to dedupe identical situations
- [ ] Low-confidence escape: when no sim candidate clears threshold,
      ask LLM to suggest an action with rationale
- [ ] Strict timeout (1s); if exceeded, drop to heuristic-only output
- [ ] All LLM I/O written to session log for review

## M7 — Overlay UI (Electron)

- [ ] Transparent always-on-top window
- [ ] Click-through with selective interactive regions
- [ ] Anchor to Hearthstone window (macOS Accessibility API)
- [ ] Advice panel (current top recommendation)
- [ ] "Why?" expand → LLM explanation
- [ ] Board panel (recommended positioning)
- [ ] Opponent panel (projected scaling per opponent)
- [ ] Damage forecast widget
- [ ] Hotkeys: toggle, reload, hide
- [ ] Settings: opacity, position, hotkey rebinding

## M8 — Replay app

- [ ] Load a fixture `.log`
- [ ] Scrub through events
- [ ] State viewer at current tick
- [ ] "What advisor would have said" diff vs. what user did
- [ ] Export reviewable report as Markdown for post-game analysis

## M9 — Session logging

- [ ] JSONL session log at `logs/session-<ts>.jsonl`
- [ ] Log: parsed events, state snapshots per turn, recommendations,
      sim batch summaries, LLM round-trips
- [ ] Log rotation (keep last 50 sessions)
- [ ] Helper script to pretty-print a session log for review

## M10 — Patch update pipeline

- [ ] `scripts/bump-patch.ts`: pull HearthstoneJSON, bump sim package,
      re-run sim tests, flag diffs
- [ ] CI-style local check that the pinned patch matches installed game

---

## Open questions (don't proceed past without answering)

- **Anomaly + trinket coverage**: do we model them in the advisor or
  treat as opaque modifiers? Start opaque, layer in over time.
- **Buddies**: not in current BG patch (as of writing). Skip until they return.
- **Heroes with hero powers that change shop**: advisor needs hero-power
  hooks. Defer to M4.5 once heuristic basics are in.
