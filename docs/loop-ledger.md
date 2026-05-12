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
