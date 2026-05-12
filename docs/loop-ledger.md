# Overlay Loop Ledger

Append-only log of tasks the autonomous builder has picked, with
status. One line per task. Most-recent at the top.

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

2026-05-12 00:00  [DONE]  M12: Session pruning — pruneOldSessions(keepLast, logsDir) deletes all but most recent N session files, 3 tests (commit b4720ea)

2026-05-12 00:00  [DONE]  M13: Session replay — parseSession reads session JSONL, replays events through state reducer, returns GameState[] snapshots, 4 tests (commit 164f934)
