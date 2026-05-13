# Overlay Loop Ledger

Append-only log of tasks the autonomous builder has picked, with
status. One line per task. Most-recent at the top.

2026-05-13 07:15  [DONE]  M33: Gold spent tracker — `applyGoldSpent` handles `TAG_CHANGE tag=RESOURCES_USED` on player controller, sets `state.player.goldSpentThisTurn: number`, adds field to PlayerState, 4 tests, wired into reducer (commit 6ecbf78)

2026-05-13 07:30  [DONE]  M34: Shop size tracker — `applyShopSize` handles `TAG_CHANGE tag=NUM_MINIONS_IN_BOB_DECK` on player controller, sets `state.player.shopSize: number`, adds field to PlayerState, 4 tests, wired into reducer (commit 6bdad14)

2026-05-13 07:00  [DONE]  M33: TurnsInGame tracker — `applyTurnsInGame` handles `TAG_CHANGE tag=NUM_TURNS_IN_GAME` on player controller, sets `state.player.turnsInGame: number`, adds field to PlayerState, 4 tests, wired into reducer (commit 533ac8f)

2026-05-13 07:15  [DONE]  M33: MinionsOnBoard tracker — `applyMinionsOnBoard` handles `TAG_CHANGE tag=NUM_MINIONS_ON_BOARD` on player controller, sets `state.player.minionsOnBoard: number`, adds field to PlayerState, 4 tests, wired into reducer (commit c5628bf)

2026-05-13 07:30  [DONE]  M33: CardsDrawn tracker — `applyCardsDrawn` handles `TAG_CHANGE tag=NUM_CARDS_DRAWN_THIS_TURN` on player controller, sets `state.player.cardsDrawnThisTurn: number`, adds field to PlayerState, 4 tests, wired into reducer (commit b7dd8f7)

2026-05-13 07:45  [DONE]  M33: MinionsKilled tracker — `applyMinionsKilled` handles `TAG_CHANGE tag=NUM_MINIONS_KILLED_THIS_TURN` on player controller, sets `state.player.minionsKilledThisTurn: number`, adds field to PlayerState, 4 tests, wired into reducer (commit 9db333d)

2026-05-13 06:30  [DONE]  M31: Frozen minion handler — wire `applyFrozenMinion` into reducer — import from `./reducer/frozenMinion`, add `case 'FROZEN':` branch that calls `applyFrozenMinion` when the FROZEN tag is on a minion entity (not the player controller); 4 tests (frozen on player minion, frozen on opponent minion, no-op on player controller, no-op on non-play entity) (commit 5caa0ab)

2026-05-13 06:00  [DONE]  M1: parseShowEntity handler — `parseShowEntity(line)` parses `SHOW_ENTITY - Updating Entity=N CardID=X` lines, returns `{ kind: 'SHOW_ENTITY', entity, cardId }`; 3 tests, wired into `parseLine` in index, exported from index (commit 31e9bc1)

2026-05-13 05:30  [DONE]  M32: formatRecommendation helper — `formatRecommendation(rec: Recommendation): string` returns readable string for all 6 action types (Buy, Sell, Freeze, Reroll, TierUp, Reposition); 6 tests, exported from shared index (commit 6109a27)

2026-05-13 05:00  [DONE]  M32: minionsOnBoard + opponentMinionsOnBoard helpers — `minionsOnBoard(state)` returns player board minion count, `opponentMinionsOnBoard(state, index)` returns opponent board size or 0; 4 tests, exported from shared index (commit 593186f)

2026-05-13 05:30  [DONE]  M32: shopMinionCount helper — `shopMinionCount(state)` returns `state.player.shop.minions.length`; 2 tests, exported from shared index (commit 88ac1d5)

2026-05-13 04:00  [DONE]  M32: Hero power cardId — `applyHeroPowerCardId` handles `TAG_CHANGE tag=HERO_POWER_ID` on player controller, sets `state.player.heroPowerCardId: string | null`, 4 tests (commit 25be89c)

2026-05-12 22:00  [DONE]  M31: Cards given tracker — `applyCardsGiven` handles `TAG_CHANGE tag=NUM_CARDS_GIVEN_THIS_TURN` on player controller, sets `state.player.cardsGivenThisTurn: number`, 4 tests, wired into reducer (commit 01231aa)

2026-05-13 04:00  [DONE]  M32: Cards played tracker — `applyCardsPlayed` handles `TAG_CHANGE tag=NUM_CARDS_PLAYED_THIS_TURN` on player controller, sets `state.player.cardsPlayedThisTurn: number`, wired into reducer, 4 tests (commit 27596db)
2026-05-13 04:00  [DONE]  M32: Cards in deck tracker — `applyCardsInDeck` handles `TAG_CHANGE tag=NUM_CARDS_IN_DECK` on player controller, sets `state.player.deckSize: number`, wired into reducer, 4 tests (commit 7de90df)

2026-05-13 05:00  [DONE]  M32: Opponent elimination by HP — `applyOpponentEliminated` handles `TAG_CHANGE tag=HEALTH value=0` on opponent controller → sets `state.opponents[i].eliminated = true`, 4 tests, wired into reducer (commit 94f75f6)

2026-05-13 03:30  [DONE]  M32: Player death handler — `applyPlayerDeath` handles `TAG_CHANGE tag=HEALTH value=0` on player controller, sets `state.player.eliminated = true`, wired into reducer, 3 tests (commit 7512eb4)

2026-05-12 22:00  [DONE]  M32: Card cost tracker — `applyCardCost` handles `TAG_CHANGE tag=COST` on PLAY/SHOP entities, adds `cost: number` to Minion, wired into reducer, 5 tests (commit 65aab57)

2026-05-12 22:00  [DONE]  M32: Elite status handler — `applyElite` handles `TAG_CHANGE tag=ELITE value=1/0` on entities in PLAY zone, adds `elite: boolean` to Minion, 5 tests, wired into reducer (commit 7a8dce8)

2026-05-13 03:00  [DONE]  M32: Divine Shield handler — `applyDivineShield` handles `TAG_CHANGE tag=DIVINE_SHIELD value=1/0` on PLAY zone entities, sets `minion.divineShield`, extracted from `applyBuffs`, wired into reducer, 4 tests (commit 9d3f3b4)

2026-05-13 02:45  [DONE]  M31: Entity cardId resolver — `resolveCardId(entityId, state)` looks up entity in `state.player.entityRegistry`, returns cardId string or null; 3 tests, exported from state index (commit 4dc62c1)

2026-05-13 02:45  [DONE]  M31: Game over handler — `applyGameOver` handles `TAG_CHANGE tag=PLAYSTATE value=FINISHED` → sets `state.phase = 'end'`, 3 tests, wired into reducer (commit 4f8b653)

2026-05-13 02:45  [DONE]  M31: Trinket handler — `applyTrinket` handles `TAG_CHANGE tag=TRINKET value=1` on player controller, adds entity to hand, sets `trinketUsed` flag, 4 tests, wired into reducer (commit 63f1235)

2026-05-12 22:15  [DONE]  M10: lobbyWeight total — added `totalLobbyWeight(opponents)` to `packages/advisor/src/lobbyWeight.ts` summing all weights from `lobbyWeights`; 3 new tests (empty=0, equal hp sums to 1, eliminated excluded); exported from index (commit 05604e2)

2026-05-12 22:00  [DONE]  M28: scoreBuysWithSim n=1 smoke test — adds test calling scoreBuysWithSim with n=1, budgetMs=5000, verifies score >= 0 and action.type === 'Buy' (commit 66d8caa)

2026-05-12 22:30  [DONE]  M7: Hotkeys will-quit handler — `registerHotkeys` calls `app.on('will-quit', ...)` to unregister all shortcuts; `AppInterface` extended with `on` method; 1 new test + 2 existing test mocks fixed (commit 2b0a3f7)

2026-05-12 22:45  [DONE]  M7: damageWidget zero guard — added `avgHpDelta === 0 && winPct === 0` early return + `avgHpDelta < 0` minDmg clamp to 0; updated existing full-loss test to match new behavior; 2 new tests (zero scoreResult, negative avgHpDelta); 5/5 tests pass (commit ec2d458)

2026-05-12 23:00  [DONE]  M27: weightedScore edge cases — added 3 tests to `weightedScore.test.ts`: empty weights returns 0, single weight returns `winPct * weight`, oversized weight array uses sum of all weights (aggregated result); 10/10 tests pass (commit 3103e41)

2026-05-12 22:15  [DONE]  M8: Preload channel whitelist test — 2 new tests: verify only expected channels registered (recs-update, explanation-update), verify callbacks invoked when channels fire (commit 79819c7)

2026-05-12 22:00  [DONE]  M7: OpponentPredictor scaling — `predictOpponentBoard` scales minion attack/health by `1 + (turn-4)*0.1` capped at 1.5x when turn > 4; 5 tests (commit e1253f5)

2026-05-12 22:00  [DONE]  M27: scoreSellCandidate — `scoreSellCandidate(projectedBoard, player, opponents, n)` wraps `scoreCandidate` for sell action evaluation; 2 tests (commit ddcfb46)

2026-05-13 01:38  [DONE]  M27: recommend sell integration — `scoreSellsWithSim` added to budgetScorer, `recommend()` uses sim-based sell scoring with heuristic fallback, 2 new tests (commit c139288)

2026-05-12 23:59  [DONE]  M3: `isBattlegroundsMinion` predicate — checks `techLevel` 1-6 AND no `DUNGEON_PASSIVE_BUFF`; 4 tests, exported from card-data index (commit 5e8701e)

2026-05-12 23:59  [DONE]  M3: `getCardName(cardId)` — looks up card by `id` field, returns `name` or `cardId` unchanged if not found; 4 tests, exported from card-data index (commit 25d0eb3)

2026-05-12 23:59  [DONE]  M5: `enumerateFreezeCandidates`, `enumerateRerollCandidates`, `enumerateTierUpCandidates` — three new candidate enumerators in `candidates.ts` with 9 tests (commit 19ad4b2)

2026-05-12 23:30  [DONE]  M10: Session log `readSession` — `readSession(path)` reads a JSONL file, returns `SessionEntry[]`, skips blank lines; 3 tests (commit 83218a0)

2026-05-12 23:45  [DONE]  M29: `summarizeDiff` report — `summarizeDiff(diffs: AdvisorDiff[])` returns multi-line markdown listing turns where actual ≠ recommended actions as "Turn N: did X, advisor said Y"; 5 tests (commit 48968bc)

2026-05-12 22:00  [DONE]  M30: opponentPanel worst-threat selector — `getWorstThreat(opponents)` returns non-eliminated opponent with highest board minion count (ties: first), null if all eliminated or empty; 4 tests (commit 5e59570)

2026-05-12 23:15  [DONE]  M25: overlayState gold/tier selectors — `getGold(state)` and `getTier(state)` with 4 tests (commit 19019da)

2026-05-12 22:45  [DONE]  M29: Damage forecast IPC push — `overlay:damage-update` sent with DamageForecast (minDmg, maxDmg, winPct), 1 test (commit 53e3b3a)

2026-05-12 23:00  [DONE]  M25: hpBucket utility — `hpBucket(hp)` returns 'critical' (<6), 'low' (6-14), 'safe' (>=15); 4 tests, exported from shared index (commit d3e3a73)

2026-05-12 23:45  [DONE]  M27: tierCurveScore edge-case tests — 3 tests: turn 2 low-gold returns 0, turn 6 healthy returns ≥0.8, turn 10 desperate-hp <0.5 (commit db083ba)

2026-05-12 22:50  [DONE]  M10: Fetch-cards script — `fetchCards(patch, outPath)` fetches HearthstoneJSON, writes cards.json; 2 tests (commit 281393c)

2026-05-12 22:30  [DONE]  M29: Opponent panel IPC push — `overlay:opponents-update` sent with opponent shape (entityId, hp, tier, eliminated), 1 test (commit 0889157)

2026-05-12 22:30  [DONE]  M29: Board panel IPC push — `overlay:board-update` sent with minion shape (cardId, attack, health, taunt, divineShield), 1 test (commit aa4be38)

2026-05-12 22:00  [DONE]  M28: Session log round-trip test — 55 files → prune(50) → 50 remain (commit ab7409d)

2026-05-12 23:30  [DONE]  M29: Scrubber seek test — added `getState()` method to `Scrubber` class, 2 new tests in `scrubber.test.ts` (currentIndex assertion + seek(0) reset), 9 total tests (commit 3d09e4c)

2026-05-12 23:18  [DONE]  M28: Opponent board prediction in budgetScorer — import `predictOpponentBoard` from `./opponentPredictor`, project opponent boards via `state.opponents.map(o => ({ ...o, board: predictOpponentBoard(o, state.turn).board }))` before `scoreCandidate`, 2 tests (commit c3ea5d1)

2026-05-12 22:30  [DONE]  M28: Pipeline integration test — `createPipeline()` fed synthetic BLOCK_START + TAG_CHANGE events, asserts turn=1 and gold=3, 1 test (commit 8969a68)

2026-05-12 22:00  [DONE]  M27: Log pruning on startup — `pruneOldSessions(50)` called at top of `createOverlayWindow` in `createOverlayWindow.ts`, exported from shared index, 1 test verifying function is callable and import exists (commit 8dbfcbf)

2026-05-12 22:00  [DONE]  M27: Renderer script — `initRenderer` bridges recs/explanation to DOM elements, `getActionText` formats all action types, 10 tests (commit 027ac81)

2026-05-12 22:00  [DONE]  M27: Reposition recommendation — `hillClimbPosition` called in `recommend()`, pushes `Reposition` action when `scoreDelta > 0.05`, 3 tests (commit b6aeab6)

2026-05-12 22:00  [DONE]  M27: Triple discover advice in recommend — early-return with score 1.0 when `pendingTriple` is set, 3 tests (commit 87a6ba1)

2026-05-12 22:00  [DONE]  M25: isShoppingPhase helper — `isShoppingPhase(state: GameState): boolean` returns `state.phase === 'shopping'`; exported from shared index; 2 tests (commit 471cba5)

2026-05-12 19:00  [DONE]  M25: Renderer HTML — `apps/overlay/src/renderer.html` with `#advice-action`, `#advice-reason`, `#explanation` divs + `loadFile` wiring in `createOverlayWindow`, 5 tests (commit c288179)

2026-05-12 21:30  [DONE]  M24: Poisonous tag handler — `applyPoisonous` handles `TAG_CHANGE tag=POISONOUS value=1/0` on entities in PLAY zone, sets `minion.poisonous`, wired into reducer, 6 tests (commit 04bf37d)

2026-05-12 21:30  [DONE]  M24: Taunt tag handler — `applyTaunt` handles `TAG_CHANGE tag=TAUNT value=1/0` on PLAY zone entities, wired into reducer, 6 tests (commit 42dc3e7)

2026-05-12 22:00  [DONE]  M23: Silence handler — `applySilence` handles `TAG_CHANGE tag=SILENCED value=1` on entities in PLAY zone, resets taunt/divineShield/poisonous/reborn to false, 4 tests, wired into reducer (commit 9400df9)

2026-05-12 21:30  [DONE]  M23: Reborn handler — `applyReborn` handles BLOCK_START with "Reborn" keyword, sets reborn=true on board minion; 4 tests, wired into reducer (commit 020dafb)

2026-05-12 00:00  [DONE]  M23: Buff tracker — `applyBuffs` handles `TAG_CHANGE tag=ATK` and `DIVINE_SHIELD` on entities in PLAY zone, updates minion attack/divineShield, 7 tests, wired into reducer (commit 12ce530)

2026-05-12 21:30  [DONE]  M23: Anomaly handler — `applyAnomaly` handles `TAG_CHANGE tag=ANOMALY` on player, sets `state.anomaly: string | null`, clears on value=0, 4 tests, wired into reducer (commit 978e4f5)

2026-05-12 21:30  [DONE]  M23: Hero identification — `applyHeroIdentify` handles `SHOW_ENTITY` where `cardId` starts with "Hero_", identifies player vs opponent by matching entity to registry controller, sets `state.player.hero.cardId` and `state.opponents[i].hero.cardId`; 4 tests, wired into reducer (commit f365a66)

2026-05-12 23:59  [DONE]  M21: Pipeline session logging — `needsExplanation` flag on Recommendation + pipeline calls `appendSessionEvent('state_snapshot', ...)` on each event, 5 tests (commit 1038b3a)

2026-05-12 14:00  [DONE]  M21: Electron main window bootstrap — `createOverlayWindow` with 800x200 transparent frameless window, contextIsolation:true, nodeIntegration:false, 4 tests (commit 5e68f4c)

2026-05-12 23:59  [DONE]  M21: State serializer — `serializeGameState` + `deserializeGameState` with Map serialization, 7 round-trip tests (commit 110937a)

2026-05-12 23:59  [DONE]  M21: Shared utility functions — `clamp`, `lerp`, `round2` with 8 tests, exported from shared index (commit 15e1149)

2026-05-12 23:30  [DONE]  M21: Wire applyMinionPlaced into reducer — added FULL_ENTITY case, CONTROLLER tag handler, fallback from applyShopBuy to applyMinionPlaced for non-shop minions, 3 integration tests (commit a1e5c96)

2026-05-12 23:45  [DONE]  M21: Increment turn counter on MAIN_READY — `applyTurnPhase` now increments `state.turn` when `event.value === 'MAIN_READY'`, 3 new tests (commit 3941ab3)

2026-05-12 23:00  [DONE]  M21: Fix duplicate TAG_CHANGE branches — removed dead ZONE=PLAY and ZONE=GRAVEYARD/REMOVEDFROMGAME duplicate branches from reducer, added 2 regression tests (commit 92b52ec)

2026-05-12 22:30  [DONE]  M1: Fixture integration test harness — `runFixtureTest` reads fixture file, parses via `parseLine`, asserts event count and type match expected; 3 tests (commit b03401a)

2026-05-12 22:00  [DONE]  M5: Worker thread offload — `createWorkerPool(size)` creates pool of `worker_threads` Workers, exposes `submitBatch` (round-robin) + `close`, 3 tests (commit 645a269)

2026-05-12 21:30  [DONE]  M5: Benchmark suite — `Benchmark` class with `addScenario`/`runAll`, `compareBenchmarks` for regression reporting, 6 tests (commit 8c5d808)

2026-05-12 13:00  [DONE]  M14: Hand tracker — `hand: number[]` field in PlayerState, `applyHandTracker` handles ZONE=HAND adds and ZONE=PLAY/GRAVEYARD/REMOVEDFROMGAME removes, 4 tests (commit 6b8a08b)

2026-05-12 08:45  [DONE]  M8: State viewer — `formatState` outputs turn, phase, hp/tier/gold, board minion count, opponent details, 5 tests (commit 914205c)

2026-05-12 10:30  [DONE]  M10: Patch update pipeline — patchVersion, setPatchVersion, patchDiff, bump-patch CLI with 9 tests (commit a33691a)

2026-05-12 08:30  [DONE]  M8: Scrubber — `Scrubber` class with `seek(n)`, `replay()`, `jump(n)`, `length` property, 7 tests (commit ebe1809)

Format:
```
YYYY-MM-DD HH:MM  [STATUS]  <one-line summary>  (commit <sha>)
```

`STATUS`: `DONE` | `REVERTED` | `QUARANTINED` | `IN-PROGRESS`

---

2026-05-11 06:30  [DONE]  Wire rerollScore into recommend() — RerollAction included in scored candidates alongside Buy/Sell/Freeze/TierUp, 8 tests (commit bf2c5a2)

2026-05-11 05:00  [DONE]  State-hash cache — hashState + LlmCache with 50-entry LRU (commit 997ba98)

2026-05-11 00:00  [DONE]  M0: workspace bootstrap — package.json, tsconfig, biome, 7 package stubs + 2 app stubs, 7 passing noop tests
2026-05-11 00:00  [DONE]  M8: OpenAI-compat client — chatCompletion POSTs to localhost:8080, 1s timeout, 7 tests (commit a9d73c3)
2026-05-11 00:00  [DONE]  M1: log-parser — HsEvent types, tokenizeLine, parseTagChange, parseFullEntity, parseBlockStart/End, streamEvents (chokidar), findActiveLogDir
2026-05-11 00:00  [DONE]  M2: state reducer — GameState types in shared, initialState, reducer (BLOCK_START/TAG_CHANGE cases for turn/health/gold/tier/eliminated)
2026-05-11 00:00  [DONE]  M3: card-data — PATCH.txt, loadCards, byDbfId index, isBattlegroundsPool predicate
2026-05-11 00:00  [DONE]  M4: sim adapter — @firestone-hs/simulate-bgs-battle wired, toFirestoneBoard, fromFirestoneTranscript, simulateBatch with determinism test
2026-05-11 00:00  [DONE]  M5: advisor heuristics — Recommendation type, tierCurveScore, tripleScore, tribeSynergyScore, recommend() v0 (top-3 buy recs)
2026-05-11 00:00  [DONE]  M6: sessionLog — appendSessionEvent/resetSession writing JSONL to logs/session-<ts>-<n>.jsonl
2026-05-11 02:35  [DONE]  M7: entity registry — EntityInfo type, EntityRegistry Map, applyEntityEvent handling FULL_ENTITY + TAG_CHANGE (ZONE/CONTROLLER/CARDID), 3 tests, exported from state index (commit 0ca05fc)
2026-05-11 02:40  [DONE]  M7: fix type-only export of EntityRegistry/EntityInfo from state index (commit 74496bb)
2026-05-11 03:00  [DONE]  M7: minionPlaced reducer — adds stub Minion to player board on ZONE=PLAY transition with controller check (commit cc10622)
2026-05-11 03:10  [DONE]  M7: minionRemoved reducer — removes minion from player board on ZONE=GRAVEYARD/REMOVEDFROMGAME with controller check, 6 tests, wired into reducer (commit 6804177)
2026-05-11 03:20  [DONE]  M7: opponent board predictor stub — predictOpponentBoard returns opp.board as-is with deep copy, 3 tests (commit 65f1171)
2026-05-11 03:30  [DONE]  M7: candidate action enumerator — enumerateBuyCandidates returns BuyCandidate per shop minion with projected board, 4 tests (commit 42c6808)
2026-05-11 00:00  [DONE]  M7: simulation scorer — scoreCandidate converts boards to Firestone format, runs simulateBatch per opponent, aggregates winPct with deterministic seeding (commit 3673a6f)
2026-05-11 00:00  [DONE]  M7: position hill-climber stub — hillClimbPosition with n=0 no-op, 6 tests (commit add7043)
2026-05-11 03:45  [DONE]  M7: time-budget guard — withBudget<T> with 5 tests, wired into advisor index (commit b50b73b)
2026-05-11 04:00  [DONE]  M8: prompt builder — buildExplainPrompt(state, recs) returns system+user message array covering all action types, 12 tests (commit 2b926d6)
2026-05-11 05:15  [DONE]  M8: explain(rec, state) — cache check, buildPrompt, async chatCompletion with timeout, LLM cache store, session logging (commit 2d841c3)

2026-05-11 05:30  [DONE]  M9: sell heuristic — sellScore with weakest/synergy/triple checks, wired into recommend(), 6 tests (commit 24aae19)

2026-05-11 06:00  [DONE]  M9: freeze execution — freezeMinion selects best shop minion to freeze based on triple+synergy scoring, wired into recommend(), 6 tests (commit 6850627)

2026-05-11 03:30  [DONE]  Freeze heuristic — freezeScore(state) returns [0,1] based on triple/synergy/hp safety, 6 tests (commit 8b84ec3)

2026-05-11 06:15  [DONE]  M9: rerollScore heuristic — returns [0,1] based on triple/synergy/hp/gold checks, 6 tests (commit 0942e5c)

2026-05-12 00:00  [DONE]  M10: HP delta in scoreCandidate — compute avgHpDelta as (wins*oppTier - losses*playerTier)/totalSims, 6 tests (commit d97a287)

2026-05-12 00:00  [DONE]  M10: Sell candidate enumerator — enumerateSellCandidates returns SellCandidate per board minion with projected board (minus that minion), 4 tests (commit 77bdc40)

2026-05-12 00:00  [DONE]  M10: Sim benchmark — bench.test.ts runs 5 batches of n=20, asserts <3000ms total (commit 3e36ac7)

2026-05-12 00:00  [DONE]  M11: Tribe + tier indexes — getCardsByTribe(tribe) and getCardsByTier(tier) with lazy caching, 4 tests (commit 328219f)

2026-05-12 00:00  [DONE]  M11: BG pool by tribe — getBgMinionsByTribe(tribe) combining isBattlegroundsPool filter + tribe index, 2 tests (commit a1b43a1)

2026-05-12 00:00  [DONE]  M12: Session list — listSessions(logsDir) returns sorted session-*.jsonl paths, 2 tests (commit 4421ab3)

2026-05-12 00:00  [DONE]  M13: Session pruning — pruneOldSessions(keepLast, logsDir) deletes all but most recent N session files, 3 tests (commit b4720ea)

2026-05-12 00:00  [DONE]  M13: Session replay — parseSession reads session JSONL, replays events through state reducer, returns GameState[] snapshots, 4 tests (commit 164f934)

2026-05-12 00:00  [DONE]  M7: Click-through toggle — overlayState module with setInteractive(bool) + IPC handler, headless test (commit d08ded7)

2026-05-12 00:00  [DONE]  M7: Position scorer — hillClimbPosition with full simulation (scoreCandidate per swap, skip eliminated opponents, multi-opponent support), 9 tests (commit 2851bef)

2026-05-12 00:00  [DONE]  M7: Anchor to Hearthstone window — macOS Accessibility API via osascript, `anchor.ts` + `anchor.test.ts`, wired into `main.ts` (commit 9635ff8)

2026-05-12 00:00  [DONE]  M7: Advice panel — `advicePanel.ts` with setAdvice/getAdvice/clearAdvice + IPC handler in `main.ts`, 3 tests (commit 3292eeb)

2026-05-12 00:00  [DONE]  M7: "Why?" expand → LLM explanation — `explanationPanel.ts` with setExplanation/getExplanation/clearExplanation + IPC handler in `main.ts`, 4 tests (commit 74c3243)

2026-05-12 00:00  [DONE]  M7: Board panel — `boardPanel.ts` with setBoardPanel/getBoardPanel/clearBoardPanel + IPC handler in `main.ts`, 3 tests (commit 3187f23)

2026-05-12 06:45  [DONE]  M7: Opponent panel — `opponentPanel.ts` with setOpponentPanel/getOpponentPanel/clearOpponentPanel + IPC handler in `main.ts`, 3 tests (commit bdb5add)

2026-05-12 07:00  [DONE]  M7: Damage forecast widget — `computeDamageForecast` derives minDmg/maxDmg from winPct + playerTier, 3 tests (commit 5d06350)

2026-05-12 07:30  [DONE]  M7: Hotkey config — `hotkeys.ts` with HotkeyConfig type, defaultHotkeyConfig, registerHotkeys(mockable interface), 7 tests (commit 294245c)

2026-05-12 08:15  [DONE]  M8: Fixture loader — `loadFixture` reads text file line-by-line, calls `parseLine`, filters nulls, 3 tests; also implemented real `parseLine` dispatcher in log-parser (commit a1a887e)

2026-05-12 08:00  [DONE]  M7: Settings persistence — `settings.ts` with OverlaySettings type, defaultSettings, loadSettings (JSON fallback), saveSettings, 7 tests (commit e1df2ad)

2026-05-12 09:00  [DONE]  M8: Advisor diff — `advisorDiff(actual, predicted)` returns human-readable +/- diff lines with formatted action labels, 13 tests (commit 820a705)

2026-05-12 09:15  [DONE]  M8: Report exporter — `exportReport` generates Markdown with `## Turn N` headings, player stats, board, opponents, top 3 recs, 7 tests (commit ff42219)

2026-05-12 12:30  [DONE]  M14: Shop sell handler — `applyShopSell` removes minion from board on ZONE=HAND, 7 tests, wired into reducer (commit 64d49d8)

2026-05-12 10:00  [DONE]  M2: Opponent health tracker — `applyOpponentHealth` finds opponent by entity ID, updates hero HP from TAG_CHANGE, 4 tests (commit d765f21)

2026-05-12 11:00  [DONE]  M2: Shop refresh handler — `applyShopRefresh` handles `ZONE_CHANGE_LIST` events, rebuilds shop.minions from entity registry entries in SHOP zone, wired into reducer, 4 tests (commit febb1fe)

2026-05-12 12:00  [DONE]  M2: Shop buy handler — `applyShopBuy` handles `TAG_CHANGE tag=ZONE` from SHOP to PLAY, moves minion from shop to board, wired into reducer, 7 tests (commit cc8436a)

2026-05-12 10:30  [DONE]  M2: Opponent tier tracker — `applyOpponentTier` finds opponent by entity ID, updates tier from TAG_CHANGE, 5 tests, wired into reducer (commit a81c4bb)

2026-05-12 00:00  [DONE]  M14: Turn phase tracker — `applyTurnPhase` maps TAG_CHANGE tag=STEP values (MAIN_READY→shopping, BEGIN_SHOOTING_ATTACK→combat, MAIN_CLEANUP→end), wired into reducer, 5 tests (commit b90ab1d)

2026-05-12 13:00  [DONE]  M15: Budget-aware buy scorer — `scoreBuysWithSim` enumerates buy candidates, scores via `scoreCandidate` wrapped in `withBudget`, returns top 3 sorted by winPct; 4 tests (commit ae8c1cb)

2026-05-12 13:30  [DONE]  M15: Weighted win scorer — `weightedWinScore(scoreResult, weights)` multiplies winPct by sum of lobby weights, 7 tests (commit 372472a)

2026-05-12 14:00  [DONE]  M15: Upgrade recommend() to use sim — calls `scoreBuysWithSim(state, 50, 2000)`, falls back to heuristic buys when sim score is 0, 2 new tests (commit ac4b7d5)

2026-05-12 14:30  [DONE]  M16: Session pretty-printer — `formatEntry` parses JSONL entries, formats as `[kind] summary` with truncation/error handling, `reviewSession` CLI; 7 tests (commit 7c80ede)

2026-05-12 21:30  [DONE]  M25: Preload script — `setupPreload` exposes `overlayBridge` with `onRecs`/`onExplanation` wiring IPC channels, 3 tests (commit 26a857d)

2026-05-12 21:30  [DONE]  M26: Session log calls in coordinator — `startCoordinator` accepts `opts?: { logFn? }`, calls `logFn`/`appendSessionEvent` with recommendation after each event, 1 test, return type changed to `Coordinator` (commit d22d982)
2026-05-12 15:00  [DONE]  M16: IPC bridge — `startBridge(win, getState, getRecs)` polls every 500ms, pushes `overlay:state-update` and `overlay:recs-update` to renderer, 4 tests (commit e04b402)

2026-05-12 15:30  [DONE]  M17: Combat damage tracker — `applyCombatDamage` handles `TAG_CHANGE tag=DAMAGE`, updates minion/hero HP, removes dead entities, wired into reducer, 13 tests (commit dd39ed9)

2026-05-12 16:00  [DONE]  M17: Deathrattle handler — `applyDeathrattle` processes BLOCK_START TRIGGER with deathrattle keywords, adds minions to hand/board, 6 tests, wired into reducer (commit 9e0a66d)

2026-05-12 16:30  [DONE]  M17: Combat phase resolver — `resolveCombatPhase(state, events)` batches TAG_CHANGE damage + BLOCK_START deathrattle events, processes in order, 7 tests (commit eb8185e)

2026-05-12 17:00  [DONE]  M14: Tier-up handler — `applyTierUp` handles PLAYER_TECH_LEVEL increment, updates tier + tierUpCost (1→6, 2→5, 3→4, 4→5, 5-7→6), 8 tests, wired into reducer (commit 225fc9c)

2026-05-12 17:30  [DONE]  M18: Freeze handler — `applyShopFreeze` handles `TAG_CHANGE tag=FROZEN` value 1/0 on player controller, sets `state.player.shop.frozen`, 3 tests, wired into reducer (commit a625a16)

2026-05-12 18:30  [DONE]  M18: Triple bonus handler — `applyTripleBonus` detects 3+ identical cardIds across board+hand+shop, sets `pendingTriple`, 8 tests (commit cb5a284)

2026-05-12 18:00  [DONE]  M18: Reroll handler — `applyShopReroll` handles `TAG_CHANGE tag=RESOURCES_USED`, decrements gold, clears shop.frozen, 3 tests, wired into reducer (commit ccd431e)

2026-05-12 19:00  [DONE]  M19: Pipeline factory — `createPipeline()` returns `{onEvent, getState, reset}` wiring reducer into event loop, 6 tests (commit a702034)

2026-05-12 19:30  [DONE]  M19: Overlay coordinator — `startCoordinator(win)` creates pipeline, wires `onEvent` → `recommend` → `setAdvice`, starts IPC bridge, returns stop fn; 4 tests (commit 48ef248)

2026-05-12 20:00  [DONE]  M19: Replay CLI wiring — `run(path)` loads fixture, creates Scrubber, replays to end, prints formatState + exportReport; 3 tests (commit 543ba0e)

2026-05-12 20:30  [DONE]  M20: Golden minion detector — `applyGoldenMinion` handles `TAG_CHANGE tag=PREMIUM value=1`, adds `golden: boolean` to Minion, 3 tests (commit b9e9f0e)

2026-05-12 19:00  [DONE]  M21: Hero power tracker — `applyHeroPower` handles `TAG_CHANGE tag=NUM_TIMES_HERO_POWER_USED_THIS_GAME`, sets `state.player.heroPowerUsedThisTurn`, 4 tests, wired into reducer (commit 7a15390)

2026-05-12 21:00  [DONE]  M22: Armor tracker — `applyArmor` handles `TAG_CHANGE tag=ARMOR` on player controller, updates `state.player.hero.armor`, 4 tests, wired into reducer (commit 3858770)

2026-05-12 05:50  [DONE]  M2: Replay fixture helper — `replayFixture(filePath)` reads raw Power.log, parses via `parseLine`, replays through reducer, returns final GameState, 4 tests (commit 00ff5df)

2026-05-12 00:00  [DONE]  M1: ZoneChangeList parser — `parseZoneChangeList()` extracted from `parseLine`, exported from index, 3 tests (commit 7e49dd5)

2026-05-12 00:00  [DONE]  M23: Lobby size tracker — `applyLobbySize` handles `TAG_CHANGE tag=NUM_MINIONS_IN_LOBBY`, adds `lobbySize` to GameState, wired into reducer, 4 tests (commit 45d5f5f)

2026-05-12 00:00  [DONE]  M23: Hand size tracker — `applyHandSize` handles `TAG_CHANGE tag=NUM_CARDS_IN_HAND` on player controller, sets `state.player.handSize: number`, 4 tests, wired into reducer (commit 151a394)

2026-05-12 00:00  [DONE]  M24: Windfury tag handler — `applyWindfury` handles `TAG_CHANGE tag=WINDFURY value=1/0`; adds `windfury: boolean` to `Minion` interface; 6 tests, wired into reducer (commit 624ec08)

2026-05-12 00:00  [DONE]  M24: Cleave tag handler — `applyCleave` handles `TAG_CHANGE tag=CLEAVE value=1/0`; adds `cleave: boolean` to `Minion` interface; 4 tests, wired into reducer (commit 46d6c3c)
