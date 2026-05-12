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
- [x] [S] Position scorer: `packages/advisor/src/positionHillClimb.ts` — full hill-climb with real simulation (scoreCandidate per swap, skip eliminated opponents, multi-opponent support), 9 tests — packages/advisor/src/positionHillClimb.ts + test (commit 2851bef)

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
- [x] [S] BG pool by tribe: `packages/card-data/src/isBattlegroundsPool.ts` — add `getBgMinionsByTribe(tribe: string): Card[]` combining `isBattlegroundsPool` filter + tribe index; test returns empty array when no cards loaded — `packages/card-data/src/isBattlegroundsPool.ts` update + test (commit a1b43a1)

## M12 — Session log improvements

- [x] [S] Session list: add `listSessions(logsDir?: string): string[]` to `packages/shared/src/sessionLog.ts` — returns sorted paths of all `session-*.jsonl` files in `logsDir` (default `logs/`); test with temp dir containing 3 fixture filenames — `packages/shared/src/sessionLog.ts` update + test (commit 4421ab3)
- [x] [S] Session pruning: add `pruneOldSessions(keepLast: number, logsDir?: string): void` to `packages/shared/src/sessionLog.ts` — deletes all but the most recent `keepLast` session files; test: write 5 files, prune(3), confirm 3 remain — `packages/shared/src/sessionLog.ts` update + test (commit b4720ea)

## M13 — Session replay

- [x] [M] Session replay: `packages/state/src/parseSession.ts` — `parseSession(filePath)` reads a session-*.jsonl file, replays events through state reducer, returns `GameState[]` snapshots; 4 tests — `packages/state/src/parseSession.ts` + test

## M7 — Overlay UI (Electron)

- [x] [S] Transparent always-on-top window — scaffolded in `apps/overlay/src/main.ts` (transparent, frameless, alwaysOnTop)
- [x] [S] Click-through toggle: add `setIgnoreMouseEvents(true)` on window ready, expose `setInteractive(bool)` IPC handler to toggle click-through; test by verifying the Electron API is called in a headless test — `apps/overlay/src/main.ts` update + test (commit d08ded7)
- [x] [S] Anchor to Hearthstone window (macOS Accessibility API) — `apps/overlay/src/anchor.ts` + test, wired into `main.ts` (commit 9635ff8)
- [x] [S] Advice panel (current top recommendation) — `advicePanel.ts` + test, wired into `main.ts` (commit 3292eeb)
- [x] [S] "Why?" expand → LLM explanation — `explanationPanel.ts` with setExplanation/getExplanation/clearExplanation + IPC handler in `main.ts`, 4 tests (commit 74c3243)
- [x] [S] Board panel (recommended positioning) — `packages/shared/src/boardPanel.ts` + `apps/overlay/src/boardPanel.test.ts` + IPC handler in `main.ts`, 3 tests (commit 3187f23)
- [x] [S] Opponent panel (projected scaling per opponent): `apps/overlay/src/opponentPanel.ts` — exports `setOpponentPanel(opponents: OpponentState[]): void`, `getOpponentPanel(): OpponentState[]`, `clearOpponentPanel(): void`; wire IPC handler `overlay:set-opponents` in `apps/overlay/src/main.ts`; 3 tests — `apps/overlay/src/opponentPanel.ts` + `apps/overlay/src/opponentPanel.test.ts` (commit bdb5add)
- [x] [S] Damage forecast widget: `apps/overlay/src/damageWidget.ts` — exports `DamageForecast` type `{minDmg: number, maxDmg: number, winPct: number}` + `computeDamageForecast(scoreResult: ScoreResult, playerTier: number): DamageForecast`; 3 tests (full-win, full-loss, 50/50) — `apps/overlay/src/damageWidget.ts` + `apps/overlay/src/damageWidget.test.ts` (commit 5d06350)
- [x] [S] Hotkey config: `apps/overlay/src/hotkeys.ts` — exports `HotkeyConfig` type `{toggle: string, reload: string, hide: string}` + `defaultHotkeyConfig(): HotkeyConfig` returning `{toggle:'Alt+B',reload:'Alt+R',hide:'Alt+H'}` + `registerHotkeys(win: BrowserWindow, cfg: HotkeyConfig): void` (calls globalShortcut.register); test `defaultHotkeyConfig` returns correct defaults — `apps/overlay/src/hotkeys.ts` + `apps/overlay/src/hotkeys.test.ts` (commit 294245c)
- [x] [S] Settings persistence: `apps/overlay/src/settings.ts` — exports `OverlaySettings` type `{opacity: number, x: number, y: number, hotkeys: HotkeyConfig}` + `defaultSettings(): OverlaySettings` + `loadSettings(path: string): OverlaySettings` (reads JSON, falls back to defaults if missing) + `saveSettings(path: string, s: OverlaySettings): void`; test round-trip with a temp file — `apps/overlay/src/settings.ts` + `apps/overlay/src/settings.test.ts` (commit e1df2ad)

## M8 — Replay app

- [x] [S] Fixture loader: `apps/replay/src/loadFixture.ts` — `loadFixture(path: string): HsEvent[]` reads a text file line-by-line, calls `parseLine` on each, filters nulls; test with a 3-line fixture string written to a temp file, assert 2 events returned (1 garbage line) — `apps/replay/src/loadFixture.ts` + `apps/replay/src/loadFixture.test.ts` (also implemented real `parseLine` dispatcher in log-parser)
- [x] [S] Scrubber: `apps/replay/src/scrubber.ts` — `Scrubber` class constructor takes `HsEvent[]`; `.seek(n): GameState` applies first n events; `.length: number` property; test: seek(0)=initialState, seek(1)=state after first event — `apps/replay/src/scrubber.ts` + `apps/replay/src/scrubber.test.ts` (commit ebe1809)
- [x] [S] State viewer: `apps/replay/src/stateViewer.ts` — `formatState(state: GameState): string` returns multi-line text: turn, phase, player hp/tier/gold, board minion count, opponent count; test with `initialState()` output contains "turn: 0" — `apps/replay/src/stateViewer.ts` + `apps/replay/src/stateViewer.test.ts` (commit 914205c)
- [x] [S] Advisor diff: `apps/replay/src/advisorDiff.ts` — `advisorDiff(actual: Recommendation[], predicted: Recommendation[]): string` returns human-readable diff lines like "+ Buy X (score 0.8)" / "- TierUp (score 0.6)"; test empty arrays returns empty string — `apps/replay/src/advisorDiff.ts` + `apps/replay/src/advisorDiff.test.ts` (commit 820a705)
- [x] [S] Report exporter: `apps/replay/src/exportReport.ts` — `exportReport(turns: {state: GameState, recs: Recommendation[]}[]): string` returns Markdown with a `## Turn N` heading per turn + top 3 recommendations; test with 1-turn input contains "## Turn" — `apps/replay/src/exportReport.ts` + `apps/replay/src/exportReport.test.ts` (commit ff42219)

## M2 — State reducer foundations (continued)

- [x] [S] Opponent health tracker: add `applyOpponentHealth(state, event)` to `packages/state/src/reducer/opponentHealth.ts` — finds opponent by entity ID matching `event.entity`, updates `state.opponents[i].hero.hp`; test: 3 opponents, update middle one's HP, assert only middle changed — `packages/state/src/reducer/opponentHealth.ts` + test (commit d765f21)
- [x] [S] Opponent tier tracker: add `applyOpponentTier(state, event)` to `packages/state/src/reducer/opponentTier.ts` — finds opponent by entity ID, updates `state.opponents[i].tier`; test: update opponent tier from 3→5, assert only that opponent changed — `packages/state/src/reducer/opponentTier.ts` + test (commit a81c4bb)
- [x] [S] Shop refresh handler: add `TAG_CHANGE tag=ZONE_CHANGE_LIST` case to reducer → update `state.player.shop.minions` from entity registry; test: shop refresh event replaces shop minions — `packages/state/src/reducer/shopRefresh.ts` + test (commit febb1fe)
- [x] [S] Shop buy handler: `TAG_CHANGE tag=ZONE` from SHOP to PLAY on player controller → add minion to player board, remove from shop; test: buy shop minion appears on board — `packages/state/src/reducer/shopBuy.ts` + test (commit cc8436a)

## M10 — Patch update pipeline

- [x] [S] Patch version reader: `packages/card-data/src/patchVersion.ts` — `patchVersion(): string` reads `PATCH.txt` synchronously and returns the trimmed string; test: returns "30.4.3" from existing file — `packages/card-data/src/patchVersion.ts` + test (commit a33691a)
- [x] [S] Patch version setter: `packages/card-data/src/setPatchVersion.ts` — `setPatchVersion(version: string): void` writes to `PATCH.txt`; test: write "31.0.0", read back confirms — `packages/card-data/src/setPatchVersion.ts` + test (commit a33691a)
- [x] [S] Patch diff checker: `packages/card-data/src/patchDiff.ts` — `patchDiff(oldCards: Card[], newCards: Card[]): {added: Card[], removed: Card[], statChanges: {id: string, oldStat: string, newStat: string}[]}` compares two card arrays, returns added/removed by dbfId and stat changes (cost/attack/health) for shared cards; 5 tests — `packages/card-data/src/patchDiff.ts` + test (commit a33691a)
- [x] [S] Bump script: `scripts/bump-patch.ts` — CLI that reads current patch, fetches new cards from HearthstoneJSON, runs `patchDiff` against old cards.json, writes new `cards.json` and `PATCH.txt`, prints diff summary to stdout; test: stub fetch, assert diff output format — `scripts/bump-patch.ts` + test (commit a33691a)

## M14 — State reducer completions

- [x] [S] Shop sell handler: `packages/state/src/reducer/shopSell.ts` — reducer case: `TAG_CHANGE tag=ZONE value=HAND` on an entity that is currently on `state.player.board` → remove that entityId from board + update entityRegistry zone; wire into reducer.ts; 3 tests — `packages/state/src/reducer/shopSell.ts` + test (commit 64d49d8)
- [x] [S] Turn phase tracker: `packages/state/src/reducer/turnPhase.ts` — reducer case: `TAG_CHANGE tag=STEP` — `MAIN_READY`→`'shopping'`, `BEGIN_SHOOTING_ATTACK`→`'combat'`, `MAIN_CLEANUP`→`'end'`; wire into reducer.ts; 3 tests — `packages/state/src/reducer/turnPhase.ts` + test (commit b90ab1d)
- [x] [S] Hand tracker: add `hand: number[]` field to `PlayerState` in `packages/shared/src/state.ts` (entityIds); add reducer cases to `packages/state/src/reducer/handTracker.ts`: ZONE=HAND adds, ZONE=PLAY/GRAVEYARD removes from hand; update `initialState()`; 4 tests — `packages/state/src/reducer/handTracker.ts` + test (commit 6b8a08b)

## M15 — Advisor sim integration

- [x] [S] Budget-aware buy scorer: `packages/advisor/src/budgetScorer.ts` — `scoreBuysWithSim(state: GameState, n: number, budgetMs: number): Recommendation[]` — for each shop minion, projects `enumerateBuyCandidates`, calls `scoreCandidate` via `withBudget`, returns top 3 sorted by winPct; test with n=0 returns recs with score 0 — `packages/advisor/src/budgetScorer.ts` + test (commit ae8c1cb)
- [x] [S] Weighted win scorer: `packages/advisor/src/weightedScore.ts` — `weightedWinScore(scoreResult: ScoreResult, weights: number[]): number` multiplies per-opponent winPct by lobby weights and sums; test: all weights equal → average winPct — `packages/advisor/src/weightedScore.ts` + test (commit 372472a)
- [x] [S] Upgrade `recommend()` to use sim: update `packages/advisor/src/recommend.ts` to call `scoreBuysWithSim(state, 50, 2000)` and merge with heuristic scores; heuristics remain as fallback if sim returns empty; test: with 0 sims still returns ≥1 recommendation — `packages/advisor/src/recommend.ts` update + test (commit ac4b7d5)

## M16 — Session review tooling

- [x] [S] Session pretty-printer: `scripts/review-session.ts` — Bun CLI: reads a `logs/session-*.jsonl` file, prints each entry as `[kind] payload-summary` to stdout; export `formatEntry(line: string): string`; test `formatEntry` with a hand-crafted JSONL line returns a non-empty string — `scripts/review-session.ts` + test (commit 7c80ede)
- [x] [S] IPC bridge module: `apps/overlay/src/ipcBridge.ts` — `startBridge(win: BrowserWindow, getState: () => GameState, getRecs: () => Recommendation[]): void` sets up a 500ms poll that pushes `overlay:state-update` and `overlay:recs-update` events to the renderer; test: mock win.webContents.send called with correct channel names — `apps/overlay/src/ipcBridge.ts` + `apps/overlay/src/ipcBridge.test.ts` (commit e04b402)
- [x] [S] Overlay state snapshot: `apps/overlay/src/overlayState.ts` (already exists as M7 click-through toggle module — M16 snapshot type `OverlaySnapshot` + `makeSnapshot` would conflict; skip or rename existing) — `apps/overlay/src/overlayState.ts` (conflicts with M7 — see note)

## M17 — Combat resolution

- [x] [S] Combat damage tracker: `packages/state/src/reducer/combatDamage.ts` — `applyCombatDamage(state, event)` handles `TAG_CHANGE tag=DAMAGE` on entities in PLAY zone, subtracts damage from minion/hero health, removes dead entities from board; test: 3 damage to 2-health minion removes it from board — `packages/state/src/reducer/combatDamage.ts` + test (commit dd39ed9)
- [x] [S] Deathrattle handler: `packages/state/src/reducer/deathrattle.ts` — `applyDeathrattle(state, event)` processes `BlockStart` of type `TRIGGER` with deathrattle keywords (DEATHRATTLE: Add a minion, Reborn, etc.), re-enters deathrattle minions into hand/board; test: Deathrattle minion dies → new minion appears in hand — `packages/state/src/reducer/deathrattle.ts` + test (commit 9e0a66d)
- [x] [M] Combat phase resolver: `packages/state/src/reducer/combatPhase.ts` — `resolveCombatPhase(state, events)` takes a batch of combat events, applies damage/deathrattles in order, returns updated state; test: 2v2 combat with deathrattles resolves correctly — `packages/state/src/reducer/combatPhase.ts` + test (commit eb8185e)
- [x] [S] Tier-up handler: `packages/state/src/reducer/tierUp.ts` — `applyTierUp(state, event)` handles `TAG_CHANGE tag=PLAYER_TECH_LEVEL` increment (tier 3→4→etc.), updates `state.player.tier` and recalculates `tierUpCost` (3→4→5→6→7); test: tier 3→4 sets tierUpCost to 4 — `packages/state/src/reducer/tierUp.ts` + test (commit 225fc9c)

## M18 — Shop mechanics

- [x] [S] Freeze handler: `packages/state/src/reducer/shopFreeze.ts` — `applyShopFreeze(state, event)` handles `TAG_CHANGE tag=FROZEN value=1` on player controller → sets `state.player.shop.frozen = true`; and `value=0` → false; wire into reducer.ts; 3 tests — `packages/state/src/reducer/shopFreeze.ts` + test (commit a625a16)
- [x] [S] Reroll handler: `packages/state/src/reducer/shopReroll.ts` — `applyShopReroll(state, event)` handles `TAG_CHANGE tag=RESOURCES_USED` on own controller → decrements `state.player.gold` by the value; also clears `shop.frozen = false` on reroll; wire into reducer.ts; 3 tests — `packages/state/src/reducer/shopReroll.ts` + test (commit ccd431e)
- [x] [S] Triple bonus handler: `packages/state/src/reducer/tripleBonus.ts` — `applyTripleBonus(state, event)` detects when 3 identical cardIds appear across board+hand (by checking entityRegistry), sets a `state.player.pendingTriple: string | null` field (add to PlayerState); 3 tests: no triple returns null, 3 of same returns cardId — `packages/state/src/reducer/tripleBonus.ts` + test (commit cb5a284)

## M19 — Integration pipeline

- [x] [S] Pipeline factory: `packages/state/src/pipeline.ts` — `createPipeline(): {onEvent: (e: HsEvent) => void, getState: () => GameState}` wires `streamEvents` output into `reducer`, exposes current state; test: construct pipeline, feed 2 TAG_CHANGE events, assert state reflects both — `packages/state/src/pipeline.ts` + test (commit a702034)
- [x] [S] Overlay coordinator: `apps/overlay/src/coordinator.ts` — `startCoordinator(win: BrowserWindow): () => void` (returns stop fn) — creates pipeline, on each state change calls `setAdvice(recommend(state))`, pushes via ipcBridge; test: mock win and recommend, assert setAdvice called after event — `apps/overlay/src/coordinator.ts` + `apps/overlay/src/coordinator.test.ts` (commit 48ef248)
- [x] [S] Replay CLI wiring: update `apps/replay/src/main.ts` so `run(path)` calls `loadFixture(path)`, creates `Scrubber`, seeks to end, prints `formatState` + `exportReport`; test: `run` with a 2-event fixture file returns a string containing "## Turn" — `apps/replay/src/main.ts` update + test (commit 543ba0e)

## M20 — Golden minion and hero power stubs

- [x] [S] Golden minion detector: `packages/state/src/reducer/goldenMinion.ts` — `applyGoldenMinion(state, event)` handles `TAG_CHANGE tag=PREMIUM value=1` on an entity in the player board or shop → sets `minion.golden = true` on that entity (add `golden: boolean` to Minion); wire into reducer; 3 tests — `packages/state/src/reducer/goldenMinion.ts` + test (commit b9e9f0e)
- [x] [S] Hero power tracker: `packages/state/src/reducer/heroPower.ts` — `applyHeroPower(state, event)` handles `TAG_CHANGE tag=NUM_TIMES_HERO_POWER_USED_THIS_GAME value=N` → sets `state.player.heroPowerUsedThisTurn = true` (add field to PlayerState, reset to false on MAIN_READY step); 4 tests — `packages/state/src/reducer/heroPower.ts` + test (commit 7a15390)
- [x] [S] Armor tracker: `packages/state/src/reducer/armor.ts` — `applyArmor(state, event)` handles `TAG_CHANGE tag=ARMOR` on player controller, updates `state.player.hero.armor`; 4 tests, wired into reducer (commit 3858770)

## M2 — State model (continued)

- [x] [S] Replay fixture helper: `packages/state/src/replayFixture.ts` — `replayFixture(filePath: string): GameState` reads a raw Power.log text file line-by-line, calls `parseLine` on each line, filters nulls, and replays through `reducer` returning the final `GameState`; 4 tests: empty file returns initialState, single TAG_CHANGE event updates state, multi-line file with garbage lines returns correct final state, non-existent file throws — `packages/state/src/replayFixture.ts` + test (commit 00ff5df)

## M5 — Advisor: simulation search (continued)

- [x] [M] Benchmark suite: `packages/sim/src/bench.ts` — `Benchmark` class with `addScenario(name, boards, n, seed)`, `runAll(): Record<string, BenchResult>`, `BenchResult { durationMs, winPct, sims }`; exports `compareBenchmarks(old: Record<string, BenchResult>, new: Record<string, BenchResult>): string` for regression reporting; 6 tests — `packages/sim/src/bench.ts` + test (commit 8c5d808)

- [x] [S] Worker thread offload: `packages/sim/src/worker.ts` — `createWorkerPool(size: number): WorkerPool` using `worker_threads`, exposes `submitBatch(boards, n, seed): Promise<BatchResult>`; test: pool processes 3 batches concurrently, asserts results match single-threaded output — `packages/sim/src/worker.ts` + test (commit 645a269)

## M1 — Log parser (continued)

- [x] [S] Fixture integration test harness: `packages/log-parser/src/fixtureTest.ts` — `runFixtureTest(fixturePath: string, expectedEvents: HsEvent[]): void` reads a fixture file, parses all lines, asserts event count and types match expected; 3 tests: exact match passes, wrong count fails, wrong type fails — `packages/log-parser/src/fixtureTest.ts` + test (commit b03401a)

## M21 — Reducer completeness + state utilities

- [x] [S] Fix duplicate TAG_CHANGE branches in reducer: `packages/state/src/reducer.ts` has two identical ZONE=PLAY and two identical ZONE=GRAVEYARD branches — remove the second occurrence of each duplicate; add 2 regression tests confirming `applyShopBuy` still fires on ZONE=PLAY and `applyMinionRemoved` still fires on ZONE=GRAVEYARD — `packages/state/src/reducer.ts` + test (commit 92b52ec)

- [x] [S] Wire `applyMinionPlaced` into reducer: import `applyMinionPlaced` from `./reducer/minionPlaced` in `packages/state/src/reducer.ts`; add `case 'FULL_ENTITY':` branch that calls `applyMinionPlaced(state, event)`; 3 tests: FULL_ENTITY event with ZONE=PLAY updates board size — `packages/state/src/reducer.ts` update + test (commit a1e5c96)

- [x] [S] Increment turn counter on MAIN_READY: in `packages/state/src/reducer/turnPhase.ts`, when `event.value === 'MAIN_READY'` increment `state.turn` AND set phase to 'shopping'; 3 tests: turn starts at 1, increments to 2 on second MAIN_READY, phase set to shopping — `packages/state/src/reducer/turnPhase.ts` update + test (commit 3941ab3)

- [x] [S] State serializer: `packages/state/src/serialize.ts` — `serializeGameState(state: GameState): string` (JSON.stringify), `deserializeGameState(json: string): GameState` (JSON.parse with cast); round-trip test with 4 assertions (turn preserved, phase preserved, board length preserved, shop length preserved); export both from `packages/state/src/index.ts` — `packages/state/src/serialize.ts` + test (commit 110937a)

- [x] [S] Shared utility functions: `packages/shared/src/utils.ts` — `clamp(n: number, lo: number, hi: number): number`, `lerp(a: number, b: number, t: number): number`, `round2(n: number): number` (rounds to 2 decimal places using `Math.round(n * 100) / 100`); export all three from `packages/shared/src/index.ts`; 8 tests (clamp low, clamp high, clamp mid, lerp 0, lerp 1, lerp 0.5, round2 x2) — `packages/shared/src/utils.ts` + test (commit 15e1149)

- [x] [S] Add `needsExplanation` flag to Recommendation: add `needsExplanation?: boolean` to `Recommendation` interface in `packages/shared/src/recommendation.ts`; update `packages/advisor/src/recommend.ts` to set `needsExplanation: true` on each rec when all recommendations have `score < 0.4` or the array is empty; 4 tests (empty=true, all low score=true, mixed=false, all high=false) — `packages/shared/src/recommendation.ts` update + `packages/advisor/src/recommend.ts` update + test (commit 1038b3a)

- [x] [S] Pipeline session logging: in `packages/state/src/pipeline.ts`, after each `onEvent` call, invoke `appendSessionEvent('state_snapshot', { turn: state.turn, phase: state.phase, boardSize: state.player.board.minions.length })`; test verifies pipeline calls session logging without crashing — `packages/state/src/pipeline.ts` update + test (commit 1038b3a)

- [x] [M] Electron main window bootstrap: in `apps/overlay/src/main.ts`, implement `createOverlayWindow(BrowserWindowCtor: typeof BrowserWindow): BrowserWindow` that instantiates a transparent, always-on-top, frame-less BrowserWindow with `width:800, height:200, transparent:true, frame:false, alwaysOnTop:true, webPreferences:{ contextIsolation:true, nodeIntegration:false }`; test by passing a spy constructor and asserting it was called with those exact options — `apps/overlay/src/main.ts` update + test (commit 5e68f4c)

## M23 — Game state completeness

- [x] [S] Lobby size tracker: `packages/state/src/reducer/lobbySize.ts` — `applyLobbySize(state, event)` handles `TAG_CHANGE tag=NUM_MINIONS_IN_LOBBY` on player controller → sets `state.lobbySize: number`; add `lobbySize: number` field to `GameState`; wire into reducer; 4 tests (initial=8, decrement on elimination, stays constant, reflected in state) — `packages/state/src/reducer/lobbySize.ts` + test (commit 45d5f5f)
- [ ] [S] Hero identification: `packages/state/src/reducer/heroIdentify.ts` — `applyHeroIdentify(state, event)` handles `SHOW_ENTITY` where `cardId` starts with "Hero_" → identifies player vs opponent by matching `entity` field to known entity IDs; sets `state.player.hero.cardId` and `state.opponents[i].hero.cardId`; 4 tests (player hero identified, opponent hero identified, no match returns unchanged, duplicate ignored) — `packages/state/src/reducer/heroIdentify.ts` + test
- [ ] [S] Anomaly handler: `packages/state/src/reducer/anomaly.ts` — `applyAnomaly(state, event)` handles `TAG_CHANGE tag=ANOMALY` → sets `state.anomaly: string | null` (add to GameState); tracks current shop anomaly name; 4 tests (null when no anomaly, set on ANOMALY tag, cleared on ANOMALY=0, persisted across turns) — `packages/state/src/reducer/anomaly.ts` + test
- [ ] [S] Reborn handler: `packages/state/src/reducer/reborn.ts` — `applyReborn(state, event)` handles `BLOCK_START` with `triggerKeyword` containing "Reborn" → sets `reborn: true` on the minion that re-enters the board (identified by new entityId matching deathrattle pattern); 4 tests (reborn minion on board has reborn=true, non-reborn deathrattle doesn't set it, opponent reborn ignored, multiple reborns tracked) — `packages/state/src/reducer/reborn.ts` + test

## Quarantined

(tasks the loop got stuck on — investigate manually before re-queuing)

- [Q] Record fixture: requires a live Hearthstone Battlegrounds session. Run `scripts/enable-hs-logging.sh`, play a BG match, then copy `~/Library/Logs/Blizzard/Hearthstone/Logs/Hearthstone_<latest>/Power.log` into `fixtures/turn-1-bootstrap.log` and create `fixtures/README.md`.
