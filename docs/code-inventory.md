# Code inventory

Snapshot of every exported symbol in `packages/*/src/` and
`apps/*/src/`. Refresh via `/plan-overnight` before each batched
planning session.

**Last refreshed:** 2026-05-13

---

## packages/state/src

- `applyEvent<S>(state, _event)` — placeholder pass-through (index.ts:1)
- `initialState()` — returns blank GameState (initialState.ts:3)
- `reducer(state, event)` — main dispatch for all HsEvents (reducer.ts:61)
- `createPipeline()` → `Pipeline { onEvent, getState }` (pipeline.ts:13)
- `applyEntityEvent(registry, event)` (entityRegistry.ts:11)
- `parseSession(filePath)` → GameState[] (parseSession.ts:37)
- `resolveCardId(entityId, state)` → string|null (entityCardId.ts:3)
- `replayFixture(filePath)` → GameState (replayFixture.ts:15)
- `serializeGameState(state)` → string (serialize.ts:147)
- `deserializeGameState(json)` → GameState (serialize.ts:312)

### reducer sub-handlers (one per file in `state/src/reducer/`)

Wired in `reducer.ts` dispatch: anomaly, armor, attackBuff, cardCost,
cardId, cardsDrawn, cardsGiven, cardsInDeck, cardsPlayed, cleave,
combatDamage, deathrattle, divineShield, elite, fatigue, frozenMinion,
gameOver, gold, goldSpent, goldenMinion, handSize, handTracker, health
(hero), healthBuff (minion), heroIdentify, heroPower, heroPowerCardId,
heroPowerCost, lifesteal, lobbySize, minionPlaced, minionRemoved,
minionsKilled, minionsOnBoard, opponentEliminated, opponentHealth,
opponentTier, playerDeath, playerLost, poisonous, race, reborn,
shopBuy, shopFreeze, shopRefresh, shopReroll, shopSell, shopSize,
silence, taunt, tierUp, trinket, tripleBonus, turnPhase, turnsInGame,
windfury.

**Unwired exports (live code, not in reducer.ts dispatch):**

- `applyBuffs` (buffs.ts:4) — duplicate of `applyDivineShield`; not wired.
- `applyTier` (tier.ts:4) — duplicate of `applyTierUp`; not wired.
- `resolveCombatPhase` (combatPhase.ts:154) — combat-event resolver; not wired.

---

## packages/advisor/src

- `recommend(state)` → `Recommendation[]` (recommend.ts:19)
- `withBudget<T>(fn, ms, fallback)` → T (withBudget.ts:1)
- `weightedWinScore(scoreResult, weights)` → number (weightedScore.ts:15)
- `lobbyWeights(opponents)` → number[] (lobbyWeight.ts:7)
- `totalLobbyWeight(opponents)` → number (lobbyWeight.ts:20)
- `predictOpponentBoard(opp, turn)` → `{minions}` (opponentPredictor.ts:10)
- `scoreCandidate(player, opponents, n)` → `ScoreResult` (simScorer.ts:19)
- `scoreSellCandidate(...)` → `ScoreResult` (simScorer.ts:76)
- `hillClimbPosition(board, playerState, opponents, n, maxSwaps?)` → `PositionResult` (positionHillClimb.ts:24)

### budgetScorer.ts

- `scoreBuysWithSim(state, n, budgetMs)` (25)
- `scoreSellsWithSim(state, n, budgetMs)` (67)
- `scoreTierUpWithSim(state, n, budgetMs)` (109)
- `scoreFreezeWithSim(state, n, budgetMs)` (157)
- `scoreRerollWithSim(state, n, budgetMs)` (205)

### candidates.ts

- `enumerateBuyCandidates(state)` → `BuyCandidate[]` (42)
- `enumerateSellCandidates(state)` → `SellCandidate[]` (69)
- `enumerateFreezeCandidates(state)` → `FreezeCandidate[]` (95)
- `enumerateRerollCandidates(state)` → `RerollCandidate[]` (110)
- `enumerateTierUpCandidates(state)` → `TierUpCandidate[]` (125)

### heuristics/

- `tierCurveScore(turn, hp, gold, tier, tierUpCost)` (tierCurve.ts:15)
- `tripleScore(shopCard, board)` (triple.ts:3)
- `tribeSynergyScore(board, candidate)` (tribeSynergy.ts:7)
- `sellScore(minion, board, state)` (sellScore.ts:11)
- `freezeMinion(state)` → `FreezeAction | null` (freezeMinion.ts:8)
- `freezeScore(state)` → number (freezeScore.ts:19)
- `rerollScore(state)` → number (rerollScore.ts:13)

---

## packages/shared/src

- `clamp(n, lo, hi)` (utils.ts:1)
- `lerp(a, b, t)` (utils.ts:5)
- `round2(n)` (utils.ts:9)
- `isShoppingPhase(state)` → boolean (utils.ts:15)
- `hpBucket(hp)` → `'critical'|'low'|'safe'` (utils.ts:21)
- `minionsOnBoard(state)` → number (utils.ts:25)
- `opponentMinionsOnBoard(state, index)` → number (utils.ts:29)
- `shopMinionCount(state)` → number (utils.ts:34)
- `formatRecommendation(rec)` → string (recommendation.ts:24)
- `setBoardPanel(state)`, `getBoardPanel()`, `clearBoardPanel()` (boardPanel.ts)
- `setOpponentPanel(state)`, `getOpponentPanel()`, `clearOpponentPanel()`, `getWorstThreat(opponents)` (opponentPanel.ts)
- `appendSessionEvent(kind, payload)`, `resetSession()`, `listSessions(dir?)`, `pruneOldSessions(keepLast, dir?)`, `readSession(path)` (sessionLog.ts)

### Types in state.ts

`Minion`, `Board`, `Shop`, `Hero`, `PlayerState`, `OpponentState`, `GameState`.

### Types in recommendation.ts

`BuyAction`, `SellAction`, `FreezeAction`, `RerollAction`, `TierUpAction`, `RepositionAction`, `RecommendationAction`, `Recommendation`.

---

## packages/log-parser/src

- `parseLine(line)` → `HsEvent | null` (index.ts:8)
- `parseTagChange(line)` → `TagChange | null` (parseTagChange.ts:6)
- `parseFullEntity(line)` → `FullEntity | null` (parseFullEntity.ts:8)
- `parseShowEntity(line)` → `ShowEntity | null` (parseShowEntity.ts:11)
- `parseBlockStart(line)`, `parseBlockEnd(line)` (parseBlock.ts)
- `parseZoneChangeList(line)` → `ZoneChangeList | null` (parseZoneChangeList.ts:5)
- `tokenizeLine(line)` → `TokenizedLine | null` (tokenize.ts:9)
- `streamEvents(filePath, onEvent)` → `Promise<StreamHandle>` (stream.ts:27)
- `findActiveLogDir(baseDir?)` → string (findActiveLogDir.ts:14)
- `runFixtureTest(fixturePath, expectedEvents)` → void (fixtureTest.ts:6)

### Types

`TagChange`, `FullEntity`, `ShowEntity`, `BlockStart`, `BlockEnd`, `ZoneChangeList`, `HsEvent` (union), `TokenizedLine`, `StreamHandle`.

---

## packages/llm/src

- `chatCompletion(messages, opts?)` → `Promise<ChatCompletionResult>` (client.ts:19)
- `hashState(state)` → string (cache.ts:8)
- `LlmCache` class (cache.ts:46)
- `buildExplainPrompt(rec, state)` → ChatMessage[] (buildPrompt.ts:3)
- `explain(rec, state)` → `Promise<string>` (index.ts:14)

---

## packages/sim/src

- `simulateBatch(player, opps, n, seed?)` → `BatchResult` (simulateBatch.ts:22)
- `toFirestoneBoard(board, player)` → `BgsBoardInfo` (adapter.ts:18)
- `bgsFormatToBoard(bgsBoard)` → `Board` (adapter.ts:31)
- `fromFirestoneTranscript(result)` → `Transcript` (fromTranscript.ts:14)
- `createWorkerPool(size)` → `WorkerPool` (worker.ts:16)
- `Benchmark` class — `addScenario`, `runAll` (bench.ts:18)
- `compareBenchmarks(old, new)` → string (bench.ts:59)

---

## packages/card-data/src

- `loadCards()` → `Card[]` (loadCards.ts:9)
- `fetchCards(patch, outPath)` → `Promise<void>` (fetchCards.ts:4)
- `patchVersion()` → string (patchVersion.ts:6)
- `setPatchVersion(version)` → void (setPatchVersion.ts:6)
- `patchDiff(oldCards, newCards)` → `PatchDiff` (patchDiff.ts:9)
- `isBattlegroundsPool(card)`, `isBattlegroundsMinion(card)`, `getBgMinionsByTribe(tribe)` (isBattlegroundsPool.ts)
- `getByDbfId()`, `getCard(dbfId)`, `getCardsByTribe(tribe)`, `getCardsByTier(tier)`, `getByDbfIdStr()`, `getCardsByTechLevel(level)`, `getCardById(cardId)`, `getCardName(cardId)` (indexes.ts)

---

## apps/overlay/src

- `startCoordinator(win, opts?)` → `Coordinator` (coordinator.ts:22)
- `anchorToHearthstone(win, offsets?)` → boolean (anchor.ts:56)
- `getHearthstoneBounds()` → `WindowBounds | null` (anchor.ts:83)
- `startBridge(win, getState, getRecs, getScoreResult)` (ipcBridge.ts:8)
- `stopBridge()` (ipcBridge.ts:68)
- `initRenderer(bridge)` (renderer.ts:31), `getActionText(rec)` (renderer.ts:11)
- `setupPreload(cb, ipc)` (preload.ts:3)
- `setOverlayWin(win)`, `setInteractive(b)`, `getOverlayWin()`, `getGold(state)`, `getTier(state)` (overlayState.ts)
- `defaultHotkeyConfig()`, `registerHotkeys(win, cfg, app)`, `unregisterAllHotkeys(app)` (hotkeys.ts)
- `setExplanation(text)`, `getExplanation()`, `clearExplanation()` (explanationPanel.ts)
- `setAdvice(rec)`, `getAdvice()`, `clearAdvice()` (advicePanel.ts)
- `defaultSettings()`, `loadSettings(path)`, `saveSettings(path, settings)` (settings.ts)
- `wireLogStream(onEvent, logBaseDir?)` → `Promise<StreamHandle | null>` (logStream.ts:6)
- `computeDamageForecast(scoreResult, playerTier)` → `DamageForecast` (damageWidget.ts:22)
- `getRendererPath()`, `getWindowOptions()`, `createOverlayWindow(...)` (createOverlayWindow.ts)

### OverlayBridge channels (renderer.ts:3)

`onRecs`, `onExplanation`, `onDamage`, `onBoard`, `onOpponents`.

---

## apps/replay/src

- `loadFixture(path)` → `HsEvent[]` (loadFixture.ts:5)
- `Scrubber` class (scrubber.ts:6)
- `formatState(state)` → string (stateViewer.ts:3)
- `exportReport(turns)` → string (exportReport.ts:3)
- `diffRecs(actual, expected)` → `RecDiff[]` (advisorDiff.ts:15)
- `formatAction(rec)` → string (advisorDiff.ts:78)
- `advisorDiff(actual, predicted)` → string (advisorDiff.ts:96)
- `summarizeDiff(diffs)` → string (advisorDiff.ts:119)
- `run(path)` → string (main.ts:6)

---

## Known gaps (Step 2 candidate pool)

These are loosely covered by milestones in `docs/tasks.md` but not
exhaustively done in the backlog. Use them as the candidate pool when
planning M42+:

- **Unwired reducer code**: `applyBuffs`, `applyTier`, `resolveCombatPhase`
  — decide each (delete or wire).
- **Card-data integration in heuristics**: heuristics use minion `tribes`
  on the in-game minion, but rarely consult `card-data` indexes
  (`getCard`, `getCardsByTier`) for richer scoring.
- **Worker offload**: `createWorkerPool` exists but `recommend()` does not
  use it. Sims run on the main thread.
- **Session-log completeness**: coordinator currently logs `recommendation`
  and `state-snapshot`. Not yet logging parsed-events or LLM round-trips
  (M6 / M9 line items).
- **Renderer detail**: minion-shape rendering exists in `boardPanel.test`
  but the renderer only shows minion *count* (`#board-count`), not stats.
- **Anchor pre-flight**: `anchorToHearthstone` fails silently if HS isn't
  running. No retry, no UI signal to the user.
- **Replay app feature gaps**: state viewer exists but no UI to scrub via
  the replay app's `main.ts run()` — it just formats turn 0.
- **Edge-case test coverage**: many reducers have 4 tests but no
  cross-reducer regression tests; many parsers lack whitespace /
  malformed-input tests.
