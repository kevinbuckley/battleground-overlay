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

- [ ] [S] Create `package.json` with bun workspaces declared for `apps/*` and `packages/*`; add scripts: `test`, `typecheck`, `lint`, `lint:fix`; commit only this file — package.json
- [ ] [S] Create `tsconfig.base.json` with strict TS, `moduleResolution: bundler`, path alias `@overlay/*` → `packages/*/src`; create `tsconfig.json` extending it with project references stub — tsconfig.base.json, tsconfig.json
- [ ] [S] Create standalone `biome.json` (no parent extends) with strict rules: noExplicitAny=error, noUnusedVariables=error, formatter enabled, 2-space indent, single-quote JS; add `.gitignore` (node_modules, dist, logs/, *.log, .DS_Store) — biome.json, .gitignore
- [ ] [S] Scaffold `packages/shared` with `package.json`, `tsconfig.json` (extends base), `src/index.ts` exporting a placeholder `export type Placeholder = never;`, and a noop test — packages/shared/*
- [ ] [S] Scaffold `packages/log-parser` mirroring the shared package layout; export a stub `parseLine(line: string): null` and one test asserting `parseLine("") === null` — packages/log-parser/*
- [ ] [S] Scaffold `packages/state` — same pattern, stub `applyEvent(state, event)` that returns state unchanged + noop test — packages/state/*
- [ ] [S] Scaffold `packages/card-data` — stub `getCard(dbfId: number)` returning `null` + noop test — packages/card-data/*
- [ ] [S] Scaffold `packages/sim` — stub `simulateBatch()` returning `{wins:0,losses:0,ties:0}` + noop test — packages/sim/*
- [ ] [S] Scaffold `packages/advisor` — stub `recommend(state)` returning `[]` + noop test — packages/advisor/*
- [ ] [S] Scaffold `packages/llm` — stub `explain(rec)` returning `""` + noop test — packages/llm/*
- [ ] [S] Scaffold `apps/overlay` with an empty Electron `main.ts` that opens a transparent always-on-top window (no rendering yet); package.json + tsconfig — apps/overlay/*
- [ ] [S] Scaffold `apps/replay` as a Bun CLI stub: `bun run dev:replay <fixture>` prints "TODO" — apps/replay/*
- [ ] [S] Add `scripts/enable-hs-logging.sh` — writes `~/Library/Preferences/Blizzard/Hearthstone/log.config` with `[Power]` and `[Zone]` verbose sections; idempotent — scripts/enable-hs-logging.sh
- [ ] [S] Confirm `bun typecheck` runs across all workspaces with no errors; if it fails fix the misconfig in this iteration — repo root

## M1 — Log parser foundations

- [ ] [M] Record fixture: capture a real `Power.log` from a 1-turn BG match into `fixtures/turn-1-bootstrap.log`; document how it was captured in `fixtures/README.md` — fixtures/turn-1-bootstrap.log, fixtures/README.md
- [ ] [S] Define `HsEvent` discriminated union in `packages/log-parser/src/types.ts`: `TagChange | FullEntity | ShowEntity | BlockStart | BlockEnd | ZoneChangeList`; export from index — packages/log-parser/src/types.ts
- [ ] [S] Implement `tokenizeLine(line: string)` that splits an indented Power.log line into `{depth, kind, payload}` — packages/log-parser/src/tokenize.ts + test
- [ ] [S] Implement `parseTagChange(line)` for `TAG_CHANGE Entity=... tag=... value=...` lines; return `null` if not a tag change — packages/log-parser/src/parseTagChange.ts + test with 3 sample lines
- [ ] [S] Implement `parseFullEntity(line)` for `FULL_ENTITY - Updating ...` and `FULL_ENTITY - Creating ID=...` — packages/log-parser/src/parseFullEntity.ts + test
- [ ] [S] Implement `parseBlockStart(line)` and `parseBlockEnd(line)` — packages/log-parser/src/parseBlock.ts + test
- [ ] [M] Implement `streamEvents(filePath, onEvent)` that tails a file with chokidar, parses each new line, and calls onEvent for each recognized event; closeable — packages/log-parser/src/stream.ts + test using a temp file
- [ ] [S] Locate-latest-log-dir helper: `findActiveLogDir(): string` that returns `~/Library/Logs/Blizzard/Hearthstone/Logs/Hearthstone_<latest>` — packages/log-parser/src/findActiveLogDir.ts + test (mock fs)

## M2 — State reducer foundations

- [ ] [S] Define `GameState`, `PlayerState`, `OpponentState`, `Minion`, `Board`, `Shop`, `Hero` types in `packages/shared/src/state.ts`; export from shared — packages/shared/src/state.ts
- [ ] [S] Implement `initialState(): GameState` — empty lobby, turn 0, no players yet — packages/state/src/initialState.ts + test
- [ ] [S] Reducer case: `BLOCK_START` of type `TRIGGER` with name `TB_BaconShop_StartGame` → set `turn = 1` — packages/state/src/reducer.ts + test
- [ ] [S] Reducer case: `TAG_CHANGE tag=PLAYSTATE value=LOST` for an opponent → mark that opponent eliminated — packages/state/src/reducer/playerLost.ts + test
- [ ] [S] Reducer case: own hero `TAG_CHANGE tag=HEALTH` → update `state.player.hp` — packages/state/src/reducer/health.ts + test
- [ ] [S] Reducer case: `TAG_CHANGE tag=RESOURCES` on own controller → update `state.player.gold` (max gold for the turn) — packages/state/src/reducer/gold.ts + test
- [ ] [S] Reducer case: `TAG_CHANGE tag=PLAYER_TECH_LEVEL` on own controller → update `state.player.tier` — packages/state/src/reducer/tier.ts + test

## M3 — Card data foundations

- [ ] [S] Pin patch hash: write `packages/card-data/PATCH.txt` with `30.4.3` (or current); add `package.json` script `fetch-cards` that curls `https://api.hearthstonejson.com/v1/<PATCH>/enUS/cards.collectible.json` into `cards.json` — packages/card-data/PATCH.txt + fetch-cards script
- [ ] [S] Loader: `loadCards(): Card[]` reads `cards.json`, returns typed array; type derived from JSON schema (subset: `dbfId`, `id`, `name`, `cardClass`, `cost`, `attack`, `health`, `race`, `techLevel`, `mechanics`) — packages/card-data/src/loadCards.ts + test
- [ ] [S] Index: `byDbfId: Map<number, Card>` built lazily on first call; `getCard(dbfId)` reads from it — packages/card-data/src/indexes.ts + test
- [ ] [S] BG-pool predicate: `isBattlegroundsPool(card)` returns true if card has `BATTLEGROUND_MINION_TIER_X` mechanic or `TECH_LEVEL` set — packages/card-data/src/isBattlegroundsPool.ts + test

## M4 — Sim adapter foundations

- [ ] [S] Add `@firestone-hs/simulate-bgs-battle` as a dependency of `packages/sim`; verify it imports cleanly; add a smoke test that runs ONE matchup and asserts non-null output — packages/sim/package.json + smoke test
- [ ] [M] Adapter `toFirestoneBoard(ourBoard: Board): FirestoneBoard` — packages/sim/src/adapter.ts + test
- [ ] [M] Adapter `fromFirestoneTranscript(t): Transcript` — packages/sim/src/fromTranscript.ts + test
- [ ] [S] `simulateBatch(playerBoard, opponentBoards, n, seed) → BatchResult` — implementation + determinism test (same seed = same result twice) — packages/sim/src/simulateBatch.ts + test

## M5 — Advisor heuristics, seeds

- [ ] [S] Define `Recommendation` type in shared: `{ action, score, confidence, reason }` where action is a discriminated union `Buy|Sell|Freeze|Reroll|TierUp|Reposition` — packages/shared/src/recommendation.ts
- [ ] [S] Heuristic: `tierCurveScore(turn, hp, gold)` — return number in [0,1] meaning "should I tier up now"; lookup table from `docs/heuristics/tier-curve.md` — packages/advisor/src/heuristics/tierCurve.ts + test
- [ ] [S] Heuristic: `tripleScore(state)` — for each shop card, returns bonus if buying it would create a triple given existing board+hand+pool — packages/advisor/src/heuristics/triple.ts + test
- [ ] [S] Heuristic: `tribeSynergyScore(board, candidateCard)` — counts shared tribe members on board × tribe-bonus weight — packages/advisor/src/heuristics/tribeSynergy.ts + test
- [ ] [S] `recommend(state)` v0: scores each shop card via tierCurve + triple + tribeSynergy, returns top 3 as Buy recs — packages/advisor/src/recommend.ts + test

## M6 — Misc infrastructure

- [ ] [M] `scripts/loop.sh` — self-contained autonomous builder loop, lives in this repo. Each iter: snapshot HEAD, pick top unblocked task from docs/loop-backlog.md, invoke `claude -p` (or opencode) with .claude/commands/loop-iter.md as prompt, run `bun test && bun typecheck`, revert on failure, append to docs/loop-ledger.md, sleep 20s. Args: --iters, --max-time, --debug. Logs to logs/loop-<ts>.log — scripts/loop.sh
- [ ] [S] `scripts/stop-loop.sh` — pkill the loop and confirm — scripts/stop-loop.sh
- [ ] [S] Session log writer: `packages/shared/src/sessionLog.ts` exposes `appendSessionEvent(kind, payload)` writing JSONL to `logs/session-<ts>.jsonl`; rotates by session — packages/shared/src/sessionLog.ts + test

---

## Quarantined

(tasks the loop got stuck on — investigate manually before re-queuing)

_none yet_
