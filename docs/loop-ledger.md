# Overlay Loop Ledger

Append-only log of tasks the autonomous builder has picked, with
status. One line per task. Most-recent at the top.

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

2026-05-12 15:00  [DONE]  M16: IPC bridge — `startBridge(win, getState, getRecs)` polls every 500ms, pushes `overlay:state-update` and `overlay:recs-update` to renderer, 4 tests (commit e04b402)

2026-05-12 15:30  [DONE]  M17: Combat damage tracker — `applyCombatDamage` handles `TAG_CHANGE tag=DAMAGE`, updates minion/hero HP, removes dead entities, wired into reducer, 13 tests (commit dd39ed9)

2026-05-12 16:00  [DONE]  M17: Deathrattle handler — `applyDeathrattle` processes BLOCK_START TRIGGER with deathrattle keywords, adds minions to hand/board, 6 tests, wired into reducer (commit 9e0a66d)
