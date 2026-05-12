# Overlay Loop Backlog

Atomic, single-iteration tasks for an autonomous builder agent. Pick
the **top unblocked item** that isn't already in `loop-ledger.md` and
isn't in the **Quarantined** section at the bottom.

Each item must be:
- Doable in one ~10-minute iteration
- Verifiable by `bun test` + `bun typecheck` only (no browser, no live HS)
- Scoped narrowly: one parser rule, one reducer case, one heuristic,
  one sim adapter function

Format: `- [ ] [TIER] <task>` — `[TIER]` is `S` (small, <30 min) or
`M` (medium, ≤1 hr). **Never** `[L]` items in the loop. **Never**
"find a bug" / "audit" tasks — they trap the model.

When you finish a task: mark `[x]`, link tests, append a one-liner
to `loop-ledger.md`.

---

## M0 — Bootstrap (do these first, in order)

- [x] [S] Create `package.json` with bun workspaces declared for `apps/*` and `packages/*`; add scripts: `test`, `typecheck`, `lint`, `lint:fix`; commit only this file — package.json ✓
- [x] [S] Create `tsconfig.base.json` with strict TS, `moduleResolution: bundler`, path alias `@overlay/*` → `packages/*/src`; create `tsconfig.json` extending it with project references stub — tsconfig.base.json, tsconfig.json ✓
- [x] [S] Create standalone `biome.json` (no parent extends) with strict rules: noExplicitAny=error, noUnusedVariables=error, formatter enabled, 2-space indent, single-quote JS; add `.gitignore` (node_modules, dist, logs/, *.log, .DS_Store) — biome.json, .gitignore ✓
- [x] [S] Scaffold `packages/shared` with `package.json`, `tsconfig.json` (extends base), `src/index.ts` exporting a placeholder `export type Placeholder = never;`, and a noop test — packages/shared/* ✓
- [x] [S] Scaffold `packages/log-parser` mirroring the shared package layout; export a stub `parseLine(line: string): null` and one test asserting `parseLine("") === null` — packages/log-parser/* ✓
- [x] [S] Scaffold `packages/state` — same pattern, stub `applyEvent(state, event)` that returns state unchanged + noop test — packages/state/* ✓
- [x] [S] Scaffold `packages/card-data` — stub `getCard(dbfId: number)` returning `null` + noop test — packages/card-data/* ✓
- [x] [S] Scaffold `packages/sim` — stub `simulateBatch()` returning `{wins:0,losses:0,ties:0}` + noop test — packages/sim/* ✓
- [x] [S] Scaffold `packages/advisor` — stub `recommend(state)` returning `[]` + noop test — packages/advisor/* ✓
- [x] [S] Scaffold `packages/llm` — stub `explain(rec)` returning `""` + noop test — packages/llm/* ✓
- [x] [S] Scaffold `apps/overlay` with an empty Electron `main.ts` that opens a transparent always-on-top window (no rendering yet); package.json + tsconfig — apps/overlay/* ✓
- [x] [S] Scaffold `apps/replay` as a Bun CLI stub: `bun run dev:replay <fixture>` prints "TODO" — apps/replay/* ✓
- [x] [S] Add `scripts/enable-hs-logging.sh` — writes `~/Library/Preferences/Blizzard/Hearthstone/log.config` with `[Power]` and `[Zone]` verbose sections; idempotent — scripts/enable-hs-logging.sh ✓ delivered with initial harness
- [x] [S] Confirm `bun typecheck` runs across all workspaces with no errors; if it fails fix the misconfig in this iteration — repo root ✓

## M1 — Log parser foundations

- [ ] [M] Record fixture: capture a real `Power.log` from a 1-turn BG match into `fixtures/turn-1-bootstrap.log`; document how it was captured in `fixtures/README.md` — fixtures/turn-1-bootstrap.log, fixtures/README.md (NEEDS LIVE GAME — see Quarantined)
- [x] [S] Define `HsEvent` discriminated union in `packages/log-parser/src/types.ts`: `TagChange | FullEntity | ShowEntity | BlockStart | BlockEnd | ZoneChangeList`; export from index — packages/log-parser/src/types.ts ✓
- [x] [S] Implement `tokenizeLine(line: string)` that splits an indented Power.log line into `{depth, kind, payload}` — packages/log-parser/src/tokenize.ts + test ✓
- [x] [S] Implement `parseTagChange(line)` for `TAG_CHANGE Entity=... tag=... value=...` lines; return `null` if not a tag change — packages/log-parser/src/parseTagChange.ts + test with 3 sample lines ✓
- [x] [S] Implement `parseFullEntity(line)` for `FULL_ENTITY - Updating ...` and `FULL_ENTITY - Creating ID=...` — packages/log-parser/src/parseFullEntity.ts + test ✓
- [x] [S] Implement `parseBlockStart(line)` and `parseBlockEnd(line)` — packages/log-parser/src/parseBlock.ts + test ✓
- [x] [M] Implement `streamEvents(filePath, onEvent)` that tails a file with chokidar, parses each new line, and calls onEvent for each recognized event; closeable — packages/log-parser/src/stream.ts + test using a temp file ✓
- [x] [S] Locate-latest-log-dir helper: `findActiveLogDir(): string` that returns `~/Library/Logs/Blizzard/Hearthstone/Logs/Hearthstone_<latest>` — packages/log-parser/src/findActiveLogDir.ts + test (mock fs) ✓

## M2 — State reducer foundations

- [x] [S] Define `GameState`, `PlayerState`, `OpponentState`, `Minion`, `Board`, `Shop`, `Hero` types in `packages/shared/src/state.ts`; export from shared — packages/shared/src/state.ts ✓
- [x] [S] Implement `initialState(): GameState` — empty lobby, turn 0, no players yet — packages/state/src/initialState.ts + test ✓
- [x] [S] Reducer case: `BLOCK_START` of type `TRIGGER` with name `TB_BaconShop_StartGame` → set `turn = 1` — packages/state/src/reducer.ts + test ✓
- [x] [S] Reducer case: `TAG_CHANGE tag=PLAYSTATE value=LOST` for an opponent → mark that opponent eliminated — packages/state/src/reducer/playerLost.ts + test ✓
- [x] [S] Reducer case: own hero `TAG_CHANGE tag=HEALTH` → update `state.player.hp` — packages/state/src/reducer/health.ts + test ✓
- [x] [S] Reducer case: `TAG_CHANGE tag=RESOURCES` on own controller → update `state.player.gold` (max gold for the turn) — packages/state/src/reducer/gold.ts + test ✓
- [x] [S] Reducer case: `TAG_CHANGE tag=PLAYER_TECH_LEVEL` on own controller → update `state.player.tier` — packages/state/src/reducer/tier.ts + test ✓

## M3 — Card data foundations

- [x] [S] Pin patch hash: write `packages/card-data/PATCH.txt` with `30.4.3` (or current); add `package.json` script `fetch-cards` that curls `https://api.hearthstonejson.com/v1/<PATCH>/enUS/cards.collectible.json` into `cards.json` — packages/card-data/PATCH.txt + fetch-cards script ✓
- [x] [S] Loader: `loadCards(): Card[]` reads `cards.json`, returns typed array; type derived from JSON schema (subset: `dbfId`, `id`, `name`, `cardClass`, `cost`, `attack`, `health`, `race`, `techLevel`, `mechanics`) — packages/card-data/src/loadCards.ts + test ✓
- [x] [S] Index: `byDbfId: Map<number, Card>` built lazily on first call; `getCard(dbfId)` reads from it — packages/card-data/src/indexes.ts + test ✓
- [x] [S] BG-pool predicate: `isBattlegroundsPool(card)` returns true if card has `BATTLEGROUND_MINION_TIER_X` mechanic or `TECH_LEVEL` set — packages/card-data/src/isBattlegroundsPool.ts + test ✓

## M4 — Sim adapter foundations

- [x] [S] Add `@firestone-hs/simulate-bgs-battle` as a dependency of `packages/sim`; verify it imports cleanly; add a smoke test that runs ONE matchup and asserts non-null output — packages/sim/package.json + smoke test ✓
- [x] [M] Adapter `toFirestoneBoard(ourBoard: Board): FirestoneBoard` — packages/sim/src/adapter.ts + test ✓
- [x] [M] Adapter `fromFirestoneTranscript(t): Transcript` — packages/sim/src/fromTranscript.ts + test ✓
- [x] [S] `simulateBatch(playerBoard, opponentBoards, n, seed) → BatchResult` — implementation + determinism test (same seed = same result twice) — packages/sim/src/simulateBatch.ts + test ✓

## M5 — Advisor heuristics, seeds

- [x] [S] Define `Recommendation` type in shared: `{ action, score, confidence, reason }` where action is a discriminated union `Buy|Sell|Freeze|Reroll|TierUp|Reposition` — packages/shared/src/recommendation.ts ✓
- [x] [S] Heuristic: `tierCurveScore(turn, hp, gold)` — return number in [0,1] meaning "should I tier up now"; lookup table from `docs/heuristics/tier-curve.md` — packages/advisor/src/heuristics/tierCurve.ts + test ✓
- [x] [S] Heuristic: `tripleScore(state)` — for each shop card, returns bonus if buying it would create a triple given existing board+hand+pool — packages/advisor/src/heuristics/triple.ts + test ✓
- [x] [S] Heuristic: `tribeSynergyScore(board, candidateCard)` — counts shared tribe members on board × tribe-bonus weight — packages/advisor/src/heuristics/tribeSynergy.ts + test ✓
- [x] [S] `recommend(state)` v0: scores each shop card via tierCurve + triple + tribeSynergy, returns top 3 as Buy recs — packages/advisor/src/recommend.ts + test ✓

## M6 — Misc infrastructure

- [x] [M] `scripts/loop.sh` — autonomous builder loop. ✓ delivered with initial harness (uses opencode + MLX, prompt at scripts/loop-prompt.md)
- [x] [S] `scripts/stop-loop.sh` — graceful stop via `.loop-stop` sentinel or `--force` for pkill. ✓ delivered
- [x] [S] Session log writer: `packages/shared/src/sessionLog.ts` exposes `appendSessionEvent(kind, payload)` writing JSONL to `logs/session-<ts>.jsonl`; rotates by session — packages/shared/src/sessionLog.ts + test ✓

## M7 — Advisor: simulation search

- [x] [S] Entity registry: `packages/state/src/entityRegistry.ts` — `EntityInfo` type `{cardId: string, zone: string, controller: number}`, `EntityRegistry = Map<number, EntityInfo>`, pure `applyEntityEvent(registry, event): EntityRegistry` handling `FULL_ENTITY` (insert) and `TAG_CHANGE tag=ZONE|CONTROLLER|CARDID` (update). Export `EntityRegistry` and `applyEntityEvent` from state index. Write 3 tests — packages/state/src/entityRegistry.ts + test
- [x] [S] `packages/state/src/reducer/minionPlaced.ts` — reducer case: when `applyEntityEvent` transitions an entity to `zone=PLAY` on `controller=state.player.playerId`, add a stub Minion (entityId, cardId from registry, attack=0, health=0) to `state.player.board` if not already there. Test with a manually-built event sequence — packages/state/src/reducer/minionPlaced.ts + test (commit cc10622)
- [x] [S] `packages/state/src/reducer/minionRemoved.ts` — reducer case: when entity transitions to `zone=GRAVEYARD` or `zone=REMOVEDFROMGAME` and was previously in `zone=PLAY` on player controller, remove that entityId from `state.player.board`. Test with a pre-populated board — packages/state/src/reducer/minionRemoved.ts + test (commit 6804177)
- [x] [M] Opponent board predictor stub: `packages/advisor/src/opponentPredictor.ts` — `predictOpponentBoard(opp: OpponentState): Board` that returns opp.board as-is (no projection yet) + test — packages/advisor/src/opponentPredictor.ts + test (commit 65f1171)
- [x] [S] Candidate action enumerator: `packages/advisor/src/candidates.ts` — `enumerateBuyCandidates(state)` returns one candidate per shop minion as `{action: BuyAction, projectedBoard: Board}` — packages/advisor/src/candidates.ts + test
- [x] [M] Simulation scorer: `packages/advisor/src/simScorer.ts` — `scoreCandidate(playerBoard, playerState, opponents, n)` calls `simulateBatch` for each opponent board and returns `{winPct, avgHpDelta}` — packages/advisor/src/simScorer.ts + test (commit 3673a6f)
- [x] [S] Position hill-climber stub: `packages/advisor/src/positionHillClimb.ts` — `hillClimbPosition(board, scorer, maxSwaps)` returns best permutation found in ≤20 swaps; with n=0 sims it's a no-op — packages/advisor/src/positionHillClimb.ts + test (commit add7043)
- [x] [S] Time-budget guard: `packages/advisor/src/withBudget.ts` — `withBudget<T>(fn: () => T, ms: number, fallback: T): T` runs fn and returns fallback if wall-clock exceeds ms — packages/advisor/src/withBudget.ts + test (commit b50b73b)

## M8 — LLM layer

- [x] [S] OpenAI-compat client: `packages/llm/src/client.ts` — `chatCompletion(messages, opts)` POSTs to `http://localhost:8080/v1/chat/completions`; returns `string`; timeout 1s; throws on non-2xx — packages/llm/src/client.ts + test (commit a9d73c3)
- [x] [S] Prompt builder: `packages/llm/src/buildPrompt.ts` — `buildExplainPrompt(state, recs)` returns a system + user message array for "explain top recommendation in 1 sentence" — packages/llm/src/buildPrompt.ts + test (commit 2b926d6)
- [x] [S] State-hash cache: `packages/llm/src/cache.ts` — `hashState(state): string` (stable JSON stringify of key fields) + `LlmCache` Map with max 50 entries LRU — packages/llm/src/cache.ts + test (commit 997ba98)
- [x] [M] `explain(rec, state)` implementation: calls `buildPrompt`, checks cache, if miss calls `chatCompletion` with 1s budget via `withBudget`, stores result; logs round-trip via `appendSessionEvent` — packages/llm/src/index.ts + test (commit 2d841c3)

## M9 — Sell + freeze heuristics

- [x] [S] Sell heuristic: `packages/advisor/src/heuristics/sellScore.ts` — `sellScore(minion, board, state)` returns [0,1] based on: weakest board member by attack+health, zero synergy with remaining board, not a triple-in-progress — packages/advisor/src/heuristics/sellScore.ts + test
- [x] [S] Freeze heuristic: `packages/advisor/src/heuristics/freezeScore.ts` — `freezeScore(state)` returns [0,1]: high if shop has triple opportunity or top-tier synergy card AND player hp is safe — packages/advisor/src/heuristics/freezeScore.ts + test (commit 8b84ec3)
- [x] [S] Freeze execution: `packages/advisor/src/heuristics/freezeMinion.ts` — `freezeMinion(state)` selects best shop minion to freeze based on triple+synergy scoring, returns FreezeAction or null; wired into recommend() alongside Buy/Sell/TierUp; 6 tests — packages/advisor/src/heuristics/freezeMinion.ts + test (commit 6850627)
- [x] [S] Reroll heuristic: `packages/advisor/src/heuristics/rerollScore.ts` — `rerollScore(state)` returns [0,1]: high if shop has no synergy + no triple + hp is safe AND gold after reroll > 0 — packages/advisor/src/heuristics/rerollScore.ts + test
- [x] [S] Wire sell/freeze/reroll into `recommend()`: include them in scored candidates alongside Buy + TierUp; still return top 3 — packages/advisor/src/recommend.ts update + test (commit bf2c5a2)

---

- [x] [S] RECOVERY: Add a no-op test to packages/shared confirming Placeholder type compiles — packages/shared/src/placeholder.test.ts ✓

## M10 — Sim scoring + advisor depth

- [x] [S] HP delta in simScorer: update `scoreCandidate` in `packages/advisor/src/simScorer.ts` to compute `avgHpDelta` as weighted sum (win→+opponentTier, loss→-playerTier, tie→0) averaged across all opponents; update existing test to assert `avgHpDelta !== 0` for a non-trivial matchup — `packages/advisor/src/simScorer.ts` update + test (commit d97a287)
- [x] [S] Lobby weight helper: `packages/advisor/src/lobbyWeight.ts` — done (commit 9fb819b) ✓
- [x] [S] Sell candidate enumerator: add `enumerateSellCandidates(state: GameState): {action: SellAction, projectedBoard: Board}[]` to `packages/advisor/src/candidates.ts` — one entry per board minion, projectedBoard is board minus that minion; test with 2-minion board returns 2 candidates — `packages/advisor/src/candidates.ts` update + test (commit 77bdc40)
- [x] [S] Sim benchmark: `packages/sim/src/bench.test.ts` — run `simulateBatch` 5 times with n=20 and assert total wall-clock < 3000ms; use `performance.now()`; fails fast if sim regresses — `packages/sim/src/bench.test.ts` (commit 3e36ac7)

## M11 — Card data indexes

- [x] [S] Tribe index: add `getCardsByTribe(tribe: string): Card[]` to `packages/card-data/src/indexes.ts` — builds `byTribe: Map<string, Card[]>` lazily from `loadCards()`; test with empty card list returns [] — `packages/card-data/src/indexes.ts` update + test
- [x] [S] Tier index: add `getCardsByTier(tier: number): Card[]` to `packages/card-data/src/indexes.ts` — builds `byTier: Map<number, Card[]>` lazily; test with empty card list — `packages/card-data/src/indexes.ts` update + test
- [ ] [S] BG pool by tribe: `packages/card-data/src/isBattlegroundsPool.ts` — add `getBgMinionsByTribe(tribe: string): Card[]` combining `isBattlegroundsPool` filter + tribe index; test returns empty array when no cards loaded — `packages/card-data/src/isBattlegroundsPool.ts` update + test

## M12 — Session log improvements

- [ ] [S] Session list: add `listSessions(logsDir?: string): string[]` to `packages/shared/src/sessionLog.ts` — returns sorted paths of all `session-*.jsonl` files in `logsDir` (default `logs/`); test with temp dir containing 3 fixture filenames — `packages/shared/src/sessionLog.ts` update + test
- [ ] [S] Session pruning: add `pruneOldSessions(keepLast: number, logsDir?: string): void` to `packages/shared/src/sessionLog.ts` — deletes all but the most recent `keepLast` session files; test: write 5 files, prune(3), confirm 3 remain — `packages/shared/src/sessionLog.ts` update + test

## Quarantined

(tasks the loop got stuck on — investigate manually before re-queuing)

- [Q] Record fixture: requires a live Hearthstone Battlegrounds session. Run `scripts/enable-hs-logging.sh`, play a BG match, then copy `~/Library/Logs/Blizzard/Hearthstone/Logs/Hearthstone_<latest>/Power.log` into `fixtures/turn-1-bootstrap.log` and create `fixtures/README.md`.
