# Overlay Loop Ledger

Append-only log of tasks the autonomous builder has picked, with
status. One line per task. Most-recent at the top.

Format:
```
YYYY-MM-DD HH:MM  [STATUS]  <one-line summary>  (commit <sha>)
```

`STATUS`: `DONE` | `REVERTED` | `QUARANTINED` | `IN-PROGRESS`

---

2026-05-11 00:00  [DONE]  M0: workspace bootstrap — package.json, tsconfig, biome, 7 package stubs + 2 app stubs, 7 passing noop tests
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
