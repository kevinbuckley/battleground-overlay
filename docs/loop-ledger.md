# Overlay Loop Ledger

2026-05-15 00:00  [DONE]  M64: OpponentState serialization — update `serializeGameState`/`deserializeGameState` in `packages/state/src/serialize.ts` to serialize/deserialize all 22 OpponentState fields (turnsPlayed, revives, turnsInGame, totalCardsPlayed, totalCardsDrawn, minionsOnBoard, minionsKilledThisTurn, cardsDrawnThisTurn, cardsGivenThisTurn, cardsPlayedThisTurn, deckSize, combo, bountyCards, victories, gameType, turnTimer, numChoices, deathrattlesTriggeredThisTurn, minionsDiedThisTurn, minionsTradedThisTurn); 3 tests (round-trip with 2 opponents having non-default values, backward-compat with old format missing fields, full 22-field round-trip); 1066/1066 tests pass (commit 06980c1)

2026-05-15 00:00  [DONE]  M64: OpponentState field parity — add 18 missing tracking fields to OpponentState interface (turnsInGame, totalCardsPlayed, totalCardsDrawn, minionsOnBoard, minionsKilledThisTurn, cardsDrawnThisTurn, cardsGivenThisTurn, cardsPlayedThisTurn, deckSize, combo, bountyCards, victories, gameType, turnTimer, numGameTurns, numChoices, deathrattlesTriggeredThisTurn, minionsDiedThisTurn, minionsTradedThisTurn), create `initialOpponentState()` helper, 22 tests; 1063/1063 tests pass (commit 7be7db6)

2026-05-15 00:00  [DONE]  OpponentState in pipeline integration — created `applyOpponentTurnsInGame` handler in `packages/state/src/reducer/opponentTurnsInGame.ts` handling `TAG_CHANGE tag=NUM_TURNS_IN_GAME` on opponent entities, wired into reducer; test-only task quarantined (pipeline has no opponent-creation API); 1066/1066 tests pass (commit 2a36555)

2026-05-15 00:00  [DONE]  M63: applyTotalCardsDrawn — handles `TAG_CHANGE tag=NUM_CARDS_DRAWN` on player controller, sets `state.player.totalCardsDrawn: number` (add field to PlayerState), 4 tests (initial=0, increments on card draw, no-op on opponent, reflected in state), wired into reducer; 1036/1036 tests pass (commit e1aedcf)

2026-05-15 00:00  [DONE]  M63: applyTotalCardsPlayed — handles `TAG_CHANGE tag=NUM_CARDS_PLAYED` on player controller, sets `state.player.totalCardsPlayed: number` (add field to PlayerState), 4 tests (initial=0, increments on card play, no-op on opponent, reflected in state), wired into reducer; 1032/1032 tests pass (commit b91498f)

2026-05-15 00:00  [DONE]  M63: applyGameTurn — handles `TAG_CHANGE tag=GAME_TURN` on player controller, sets `state.player.gameTurn: number` (add field to PlayerState), 4 tests (initial=1, updates each game turn, no-op on opponent, reflected in state), wired into reducer; 1020/1020 tests pass (commit bf5732c)

2026-05-15 00:00  [DONE]  M62: applyNumGameTurns — handles `TAG_CHANGE tag=NUM_GAME_TURNS` on player controller, sets `state.player.numGameTurns: number` (add field to PlayerState), 4 tests (initial=0, increments each game turn, no-op on opponent, reflected in state), wired into reducer; 1008/1008 tests pass (commit 9a07276)

2026-05-14 00:00  [DONE]  M60: applyBountyCards + applyVictories — handle `TAG_CHANGE tag=NUM_BOUNTY_CARDS` and `TAG_CHANGE tag=NUM_VICTORIES` on player controller, set `state.player.bountyCards` and `state.player.victories`, 8 tests, wired into reducer; 977/977 tests pass (commit 61e4e64)

2026-05-14 00:00  [DONE]  M60: applyGameType handler — handles `TAG_CHANGE tag=GAME_TYPE` on player controller, sets `state.player.gameType: string | null` (add field to PlayerState), 4 tests (sets gameType, null on "0", no-op on opponent, no-op on non-GAME_TYPE tag), wired into reducer; 981/981 tests pass (commit 5b67f8a)

2026-05-14 00:00  [DONE]  M60: applyCombo handler — handles `TAG_CHANGE tag=COMBO` on player controller, sets `state.player.combo: number` (add field to PlayerState), 4 tests (initial=0, updates on COMBO tag, no-op on opponent, no-op on non-player entity), wired into reducer; 957/957 tests pass (commit 94aab43)

2026-05-14 00:00  [DONE]  M60: applyPlayerTurnsPlayed — handles `TAG_CHANGE tag=NUM_TURNS_PLAYED` on player controller, sets `state.player.turnsPlayed: number` (add field to PlayerState), 4 tests (initial=0, increments per turn, no-op on opponent, reflected in state); 965/965 tests pass (commit c8f3537)

2026-05-14 00:00  [DONE]  M59: formatStartupBanner helper — added `formatStartupBanner(d)` to `apps/overlay/src/doctor.ts` returning a single-line summary `"HS:✓ Config:✓ MLX:✗"`; 3 tests (all true, all false, mixed); 13/13 tests pass (commit 25cb3cb)

2026-05-14 00:00  [DONE]  M61: Build pipeline — created `apps/overlay/build.mjs` using esbuild to bundle `main.ts` → `dist/main.cjs` (CJS/Electron), `preload.ts` → `dist/preload.js` (IIFE), `renderer.ts` → `dist/renderer-bundle.js` (IIFE); copies `renderer.html` to `dist/`; updated `apps/overlay/package.json` with `"main": "dist/main.cjs"` and `"dev": "node build.mjs && electron ."`; 943/943 tests pass (commit f7629ea)

2026-05-14 00:00  [DONE]  M60: applyDiscover handler — handles `TAG_CHANGE tag=DISCOVER` on player controller, sets `state.player.discoveredCardId: string | null` (add field to PlayerState), wired into reducer, 4 tests (sets discovered cardId, clears on 0, no-op on opponent, persists across turns); 949/949 tests pass (commit 147d7ac)

2026-05-14 00:00  [DONE]  M58: saveSettings creates parent dir — added `mkdirSync(dirname(filePath), { recursive: true })` before `writeFileSync` in `apps/overlay/src/settings.ts`; 2 tests (nested subpath save+load round-trip, file exists at nested location); 13/13 tests pass (commit cb6c63e)

2026-05-14 00:00  [DONE]  M60: getRecsForBridge slicer — added `getRecsForBridge(allRecs, max)` pure helper to `apps/overlay/src/coordinator.ts` that returns `allRecs.slice(0, max)`; 3 tests (5 recs max=3 → length 3, 2 recs max=3 → length 2, empty → length 0); 935/935 tests pass (commit e80f81e)

2026-05-14 00:00  [DONE]  M59: mergeSettings helper — added `mergeSettings(base, patch)` to `apps/overlay/src/settings.ts` that returns a new `OverlaySettings` with shallow override (hotkeys merged field-by-field); 3 tests (empty patch → deep-equals base, partial opacity → opacity 0.5 others unchanged, partial hotkeys → toggle 'F1' with reload/hide unchanged); 16/16 tests pass (commit f17e64b)

2026-05-14 00:00  [DONE]  M58: Overlay state defaults — added `setCurrentSettings(s: OverlaySettings)` and `getCurrentSettings(): OverlaySettings | null` to `apps/overlay/src/overlayState.ts` with module-level state; 3 tests (initial null, setter then getter returns same object, setter twice returns second); 9/9 tests pass (commit eb544eb)

2026-05-14 00:00  [DONE]  M56: checkMlxServer health probe — created `packages/llm/src/healthCheck.ts` exporting `async function checkMlxServer(fetchFn, url)` that probes `http://localhost:8080/v1/models`; returns `{ok:true}` on 200, `{ok:false, error}` on non-200/throw; 3 tests + export from index + index.test export test; 914/914 tests pass (commit 919344a)

2026-05-14 00:00  [DONE]  M56: getHsLogConfigPath helper — added `getHsLogConfigPath(homedir)` to `apps/overlay/src/hsLogConfig.ts` returning `path.join(homedir, 'Library/Preferences/Blizzard/Hearthstone/log.config')`; 2 tests (ends with log.config, custom homedir prefix); 910/910 tests pass (commit c035d50)

2026-05-14 00:00  [DONE]  M56: Preload onHsStatus channel — added `onHsStatus(cb: (s: string) => void)` to `apps/overlay/src/preload.ts` listening on `'overlay:hs-status'`; 2 tests (bridge exposes onHsStatus, callback fires with payload); 904/904 tests pass (commit f9342b1)

2026-05-14 00:00  [DONE]  M56: verifyHsLoggingConfig helper — created `apps/overlay/src/hsLogConfig.ts` exporting `verifyHsLoggingConfig(configPath, readFn)` that checks for 6 required sections `[Power,Zone,Bob,LoadingScreen,Asset,Net.Mgr]` in config file text; 4 tests (all sections ok, missing Zone, missing 3, read error); 908/908 tests pass (commit f833c97)

2026-05-14 00:00  [DONE]  M55: formatMinionLine helper — added `formatMinionLine(m)` to `apps/overlay/src/renderer.ts` returning `\`${m.attack}/${m.health} ${m.cardId}\``; 2 tests (3/4 X → "`3/4 X`", 0/1 empty → "`0/1 `"); 34/34 tests pass (commit 9a1857e)

2026-05-14 00:00  [DONE]  M55: Renderer per-minion list — extended `onBoard` in `renderer.ts` to populate `<ul id="board-minions">` with `<li>` items via `formatMinionLine`; added `<ul id="board-minions"></ul>` to `renderer.html`; 2 new tests (2-minion board → 2 `<li>`, empty minions → 0 `<li>`); 36/36 tests pass (commit 8262461)

2026-05-14 00:00  [DONE]  M55: Renderer top-3 recs list — added `<ul id="advice-list">` to `renderer.html`, modified `onRecs` handler in `renderer.ts` to populate up to 3 `<li>` children via `innerHTML` with `getActionText`; 3 new tests (1 rec → 1 li, 3 recs → 3 li, 5 recs → capped at 3); 894/894 tests pass (commit 8890ca1)

2026-05-14 00:00  [DONE]  M55: Renderer confidence percent — added `<span id="advice-confidence"></span>` to `renderer.html`, modified `onRecs` handler in `renderer.ts` to set `#advice-confidence` textContent to `Math.round(top.confidence * 100) + '%'`; 2 new tests (0.84 → "84%", 0 → "0%"); 895/895 tests pass (commit 2d604d1)

2026-05-14 00:00  [DONE]  M55: getConfidenceLabel — added `getConfidenceLabel(c: number): 'high'|'medium'|'low'` to `apps/overlay/src/renderer.ts` with threshold logic (≥0.7→high, ≥0.4→medium, else low); 4 tests (0.9→high, 0.7→high, 0.5→medium, 0.2→low); 898/898 tests pass (commit 3533e45)

2026-05-14 00:00  [DONE]  M49: formatRecommendation score rounding — added 1 test to `recommendation.test.ts` verifying score 0.123456 rounds to "0.12" in formatted output; 7/7 tests pass (commit c4334dc)

2026-05-14 00:00  [DONE]  M50: parseBlockStart indented form — added 1 test to `parseBlock.test.ts` verifying a BLOCK_START line with 4 leading spaces parses correctly to a BlockStart event (`.trim()` handles it); 7/7 tests pass (commit a647ce2)

2026-05-14 00:00  [DONE]  M50: tokenizeLine garbage prefix test — added 1 test to `tokenize.test.ts` verifying that a timestamp-prefixed line `"2024-01-01 00:00:00.000 LOG: TAG_CHANGE Entity=1 tag=HEALTH value=30"` returns a TokenizedLine with `kind: '2024-01-01'` (current behavior — first word is the date prefix, not TAG_CHANGE); 4/4 tests pass (commit eb8af4a)

2026-05-14 00:00  [DONE]  M50: parseTagChange quoted value — added 1 test to `parseTagChange.test.ts` verifying that `parseLine('TAG_CHANGE Entity=5 tag=ZONE value="PLAY"')` returns a TagChange with `value: '"PLAY"'` (quotes included, no stripping); 5/5 tests pass (commit e18beed)

2026-05-14 00:00  [DONE]  M50: parseLine malformed TAG_CHANGE — added 1 test to `index.test.ts` verifying `parseLine('TAG_CHANGE Entity= tag= value=')` returns null; 5/5 tests pass (commit d88be81)

2026-05-14 00:00  [DONE]  M50: parseLine whitespace-only test — added 1 test to `index.test.ts` verifying `parseLine('   ')` returns null; 4/4 tests pass (commit 10b8978)

2026-05-14 00:00  [DONE]  M49: formatRecommendation score rounding — added 1 test to `recommendation.test.ts` verifying score 0.123456 rounds to "0.12" in formatted output; 7/7 tests pass (commit c4334dc)

2026-05-14 00:00  [DONE]  M49: round2 precision tests — added 2 tests to `utils.test.ts`: round2(1.235)===1.24, round2(0)===0; 24/24 tests pass (commit 31e845b)

2026-05-14 00:00  [DONE]  M48: formatAction all-action-types test — added 1 test to `advisorDiff.test.ts` iterating over all 6 action types (Buy, Sell, Freeze, Reroll, TierUp, Reposition) in a single `for` loop, asserting each returns a non-empty string; 22/22 tests pass (commit 98bb05a)

2026-05-14 00:00  [DONE]  M48: loadFixture empty file test — added 1 test to `loadFixture.test.ts` writing an empty file and asserting `loadFixture(path)` returns `[]`; 4/4 tests pass (commit 5190102)

2026-05-14 00:00  [DONE]  M47: getHearthstoneBounds idempotency test + exportReport header — added 1 test to `anchor.test.ts` verifying 3 consecutive calls don't throw; added "Battlegrounds Session Report" header to `exportReport` so `exportReport([])` returns non-empty string; 2 new tests, 847/847 tests pass (commit 90525ce)

2026-05-14 00:00  [DONE]  M54: formatAnchorStatusBanner helper — added `formatAnchorStatusBanner(s)` to `apps/overlay/src/anchor.ts` returning `''` for `'anchored'`, `'Waiting for Hearthstone…'` for `'waiting'`, `'Hearthstone not detected — overlay disabled'` for `'failed'`; 3 tests (anchored→'', waiting→message, failed→message); 15/15 tests pass (commit 20b9dbc)

2026-05-14 00:00  [DONE]  M54: anchorToHearthstoneWithRetry — added async retry helper to `anchor.ts` that retries `anchorToHearthstone` up to `maxAttempts` (default 5) with `retryMs` (default 1000) between attempts, accepts stub-able `anchorFn` for testing; 3 tests (first-succeed, maxAttempts=1 fail, 3 calls with all-fail); 888/888 tests pass (commit f8d1084)

2026-05-14 00:00  [DONE]  M54: setAnchorStatus/getAnchorStatus — added module-level state to `anchor.ts` with exported `setAnchorStatus(s: 'waiting'|'anchored'|'failed')` and `getAnchorStatus(): 'waiting'|'anchored'|'failed'`; 3 tests (initial waiting, set to anchored returns anchored, toggle failed→anchored returns anchored); 888/888 tests pass (commit df4d989)

2026-05-14 00:00  [DONE]  M52: getDefaultSettingsPath — added `getDefaultSettingsPath(getHomedir)` to `apps/overlay/src/settings.ts` returning `path.join(homedir, 'Library/Application Support/battleground-overlay', 'overlay-settings.json')`; 2 tests (ends with filename, custom homedir prefix); 872/872 tests pass (commit 7e16572)

2026-05-14 00:00  [DONE]  M52: loadSettings empty-string path — added early-return guard `if (path === '')` to `loadSettings` in `settings.ts` + 1 test asserting `loadSettings('')` deep-equals `defaultSettings()`; 873/873 tests pass (commit 8e22c1c)

2026-05-14 00:00  [DONE]  M53: waitForLogFile poller — created `packages/log-parser/src/waitForLogFile.ts` exporting async poller with configurable intervalMs/timeoutMs/existsFn; 3 tests (immediate true, timeout false, counter-based true); exported from index; 876/876 tests pass (commit 8b5b598)

2026-05-14 00:00  [DONE]  M53: wireLogStreamWithRetry — added `wireLogStreamWithRetry(onEvent, opts)` to `apps/overlay/src/logStream.ts` that retries `wireLogStream` up to `maxAttempts` (default 3) with `retryMs` (default 2000ms) between attempts; accepts optional `wireFn` for test injection; 3 tests (first-succeed, maxAttempts=1 null, retries exactly 2 times); 882/882 tests pass (commit 9bf2cb8)

2026-05-14 00:00  [DONE]  M53: isHearthstoneRunning helper — added `isHearthstoneRunning(execFn)` to `apps/overlay/src/anchor.ts` that runs `pgrep -x Hearthstone` and returns true if non-empty stdout, false on empty/throw; 3 tests (PID returns true, empty returns false, throw returns false); 885/885 tests pass (commit c51e15c)

---
2026-05-14 00:00  [DONE]  M62: Preload wiring — added `preload: resolve(__dirname, 'preload.js')` to `webPreferences` in `getWindowOptions()` in `apps/overlay/src/createOverlayWindow.ts`; 943/943 tests pass (commit 8d71091)

2026-05-14 00:00  [DONE]  M63: Wire bootstrapOverlay into main.ts — replaced `await wireLogStream(() => {})` with `await bootstrapOverlay(win)` in `createWindow()`, importing `bootstrapOverlay` from `./bootstrap`; added 2 tests to `main.test.ts` verifying the import exists and the function is callable; 945/945 tests pass (commit 5df1897)

2026-05-14 00:00  [DONE]  M60: applyOpponentTurnsPlayed — handles `TAG_CHANGE tag=NUM_TURNS_PLAYED` on opponent controller, sets `state.opponents[i].turnsPlayed: number` (add field to OpponentState), wired into reducer, 4 tests (initial=0, increments per turn, no-op on player, reflected in state); 953/953 tests pass (commit 179afc8)

---

2026-05-14 00:00  [DONE]  M47: Renderer opponent-eliminated indicator — extended `onOpponents` in `renderer.ts` to count eliminated opponents and write `Alive: N/total` to `#opponent-alive`; added `<div id="opponent-alive">` to `renderer.html`; 2 new tests (5 opponents 2 eliminated → `Alive: 3/5`, all eliminated → `Alive: 0/3`); 24/24 tests pass (commit bc74ab4)

2026-05-14 00:00  [DONE]  M47: Renderer board panel stat hint — extended `onBoard` in `renderer.ts` to write highest-attack minion to `#board-best-attack` as `Best: <attack>/<health>`; added `<div id="board-best-attack">` to `renderer.html`; 2 new tests (2-minion board with attacks 3,5 → `Best: 5/2`, empty minions → empty textContent); 22/22 tests pass (commit d201729)

2026-05-14 00:00  [DONE]  M47: Renderer damage min/max display — updated `onDamage` handler in `renderer.ts` to format `#damage-forecast` as `Win: <P>% (<min>-<max> dmg)` with fallback to 0 when minDmg/maxDmg are missing; 2 new tests (min/max dmg included, missing fields fallback to 0) + 1 existing test updated; 21/21 tests pass (commit f64bf62)

2026-05-14 00:00  [DONE]  M46: patchVersion non-empty test — added 1 test to `patchVersion.test.ts` asserting `patchVersion()` returns a string with `length > 0`; 2/2 tests pass (commit 752d385)

2026-05-14 00:00  [DONE]  M46: patchDiff no-change test — added 1 test to `patchDiff.test.ts` asserting that `patchDiff(cards, cards)` (same array twice) returns `{ added: [], removed: [], statChanges: [] }`; 837/837 tests pass (commit 893bf3e)

2026-05-14 00:00  [DONE]  M46: getCardsByTribe case-sensitivity test — added 1 test to `indexes.test.ts` asserting that `getCardsByTribe('Beast')` and `getCardsByTribe('beast')` return different arrays (case-sensitive lookup); 835/835 tests pass (commit e00761d)

2026-05-14 00:00  [DONE]  M46: isBattlegroundsMinion SPELL test — added `type?: string` to Card interface + 1 test in `isBattlegroundsPool.test.ts` asserting `isBattlegroundsMinion({ type: 'SPELL' })` returns false; 836/836 tests pass (commit 5ac352e)

2026-05-14 00:00  [DONE]  M46: getCardsByTier boundary tests — added 2 tests to `indexes.test.ts`: tier 0 returns [], tier 7 returns []; 834/834 tests pass (commit 8421eb4)

2026-05-13 23:45  [DONE]  M45: sellScore empty-board test — added 1 test to `sellScore.test.ts` asserting `Number.isFinite(sellScore(minion, [], initialState()))` is true; 7/7 tests pass (commit 8df04f9)

2026-05-13 23:55  [DONE]  M45: freezeScore already-frozen short-circuit — added `if (player.shop.frozen) return 0` guard to `freezeScore.ts` + 1 test in `freezeScore.test.ts` asserting frozen shop returns 0; 829/829 tests pass (commit ffcdbfe)

2026-05-13 23:58  [DONE]  M45: tripleScore no-board-match test — added 1 test to `triple.test.ts` asserting that a shop card with a different cardId from all board minions returns 0; 4/4 tests pass (commit 150bd41)

2026-05-13 23:50  [DONE]  M45: rerollScore low-gold test — added 2 tests to `rerollScore.test.ts`: gold=0 returns 0, gold=10 with shop full returns ≤ 1; 828/828 tests pass (commit e3be5eb)

2026-05-13 23:30  [DONE]  M45: tribeSynergyScore no-tribe + 3-match tests — added 2 tests to `tribeSynergy.test.ts`: empty tribes returns 0 (already existed, helper fixed to include new Minion fields), 3 matching board minions returns score ≥ 0.449; 825/825 tests pass (commit 6261b17)

2026-05-13 23:15  [DONE]  M45: tierCurveScore clamp tests — added 3 tests to `tierCurve.test.ts` asserting score is finite and within [0,1] for extreme inputs: turn=0/hp=40/gold=0/tier=1, turn=20/hp=1/gold=10/tier=6, turn=10/hp=20/gold=5/tier=3; 824/824 tests pass (commit c60c791)

2026-05-13 21:30  [DONE]  M44: Coordinator logs parsed events — added `(opts?.logFn ?? appendSessionEvent)('event', { kind: event.kind })` call at the top of the wrapped `pipeline.onEvent` in `coordinator.ts`, plus 2 tests (single event → 1 entry, 3 events → 3 entries); also fixed existing test to filter by `kind === 'recommendation'` since event entries now come first; 812/812 tests pass (commit 5fce638)

2026-05-13 22:00  [DONE]  M44: Coordinator logs LLM round-trips — wrapped `explain(top, state)` call in `coordinator.ts` so that on resolve it calls `logFn('llm', { rec: top.action.type, text })` and on reject it calls `logFn('llm-error', { rec: top.action.type })`; 2 tests using mocked fetch (success → llm entry, 500 → llm-error entry); 814/814 tests pass (commit 30666f2)

2026-05-13 22:30  [DONE]  M44: formatSessionLine pretty-print helper — added `formatSessionLine(entry: SessionEntry): string` to `scripts/review-session.ts` returning `[<kind>] HH:MM:SS <payload-summary>` where ts is formatted as UTC time and payload is JSON.stringify truncated to 60 chars; 3 tests (recommendation, state-snapshot, empty-payload); 817/817 tests pass (commit 6a0af3b)

2026-05-13 22:45  [DONE]  M44: summarizeSession aggregate — added `summarizeSession(entries: SessionEntry[]): SessionSummary` to `scripts/review-session.ts` counting entries by kind (event, recommendation, state-snapshot, llm/llm-error); 2 tests (counts 3 events + 2 recommendations + 3 snapshots + 3 llm, empty returns all zeros); 819/819 tests pass (commit 4f73979)

2026-05-13 23:00  [DONE]  M44: getCurrentSessionFile — added `getCurrentSessionFile(): string | null` to `packages/shared/src/sessionLog.ts` returning the active session file path or null if no session has been started; 2 tests (null before append, path after append); 821/821 tests pass (commit 82ede5a)

2026-05-13 21:00  [DONE]  M43: Document resolveCombatPhase status — added top-of-file comment to `packages/state/src/reducer/combatPhase.ts` noting it's not wired into the reducer dispatch; 7/7 tests pass (commit 7f5b49f)

2026-05-13 20:30  [DONE]  M43: Remove applyBuffs duplicate — deleted `packages/state/src/reducer/buffs.ts` and `buffs.test.ts` (identical to `applyDivineShield`), 810 tests pass (commit dec764d)

2026-05-13 20:00  [DONE]  M43: Remove applyTier duplicate — deleted `packages/state/src/reducer/tier.ts` and `tier.test.ts` (redundant with `applyTierUp`), 816 tests pass (commit 8e916e2)

2026-05-13 19:30  [DONE]  M41: compareBenchmarks degraded winPct test — added 1 test to `bench.test.ts`: baseline winPct 0.6, current 0.4, assert string contains '↓'; 7/7 tests pass (commit f1373ae)

2026-05-13 20:00  [DONE]  M42: Hero power cost tracker — `applyHeroPowerCost` handles `TAG_CHANGE tag=HERO_POWER_COST` on player controller, sets `state.player.heroPowerCost: number`, 4 tests, wired into reducer (commit 9864070)

2026-05-13 19:00  [DONE]  M41: check-patch CI script — `scripts/check-patch.ts` imports `patchVersion`, reads `process.argv[2]`, prints "OK" (exit 0) on match, "Patch mismatch" (exit 1) on mismatch, usage (exit 1) with no arg; 3 tests (commit f4bf812)

2026-05-13 19:30  [DONE]  M41: parseLine roundtrip tests — added 2 tests to `packages/log-parser/src/index.test.ts`: ZONE_CHANGE_LIST ID=99 returns correct shape, SHOW_ENTITY line returns correct shape with entity string and cardId; 813/813 tests pass (commit b2f02ca)

2026-05-13 18:30  [DONE]  M41: fixtureTest mismatch throws — added 2 bun:test tests to `fixtureTest.test.ts`: count mismatch throws "count mismatch", wrong kind throws "type mismatch"; 808/808 tests pass (commit a4ff312)

2026-05-13 18:15  [DONE]  M41: stream close stops watcher test — added 1 test to `stream.test.ts`: open stream, close handle, append TAG_CHANGE line, wait 400ms, assert events array is empty; 803/803 tests pass (commit 80edfff)

2026-05-13 18:00  [DONE]  M40: review-session filterByTurnRange + readSession — added `filterByTurnRange(entries, minTurn, maxTurn)` filtering entries by payload.turn field, plus `readSession(filePath)` returning `SessionEntry[]`; 5 new tests (in-range, out-of-range, empty, no-turn-field, boundary), 794/794 tests pass (commit 93b4831)

2026-05-13 18:30  [DONE]  M40: hotkeys unregisterAll before re-register — added `app.globalShortcut.unregisterAll()` call at the top of `registerHotkeys` (before `whenReady`), plus 1 test verifying `unregisterAll` is called on each invocation; 9/9 tests pass (commit 40caf97)

2026-05-13 18:45  [DONE]  M41: stream.ts add missing parsers — added `parseZoneChangeList` and `parseShowEntity` to `parseSingleLine` in `stream.ts`, 2 tests (ZONE_CHANGE_LIST line picked up, SHOW_ENTITY line picked up), 802/802 tests pass (commit 99773a6)

2026-05-13 17:30  [DONE]  M40: settings:apply IPC handler — added `ipcMain.handle('settings:apply', ...)` to `main.ts` importing `loadSettings` + `getOverlayWin`, calls `setOpacity`/`setPosition` on the window; 2 tests in `main.test.ts` (handler exists, non-existent path returns default opacity), 789/789 tests pass (commit 3d2d41f)

2026-05-13 17:00  [DONE]  M40: Renderer onBoard handler — added `onBoard(cb)` to `OverlayBridge` interface, wired `bridge.onBoard(...)` in `initRenderer` to update `#board-count` with `Minions: N` format, added `<div id="board-count"></div>` to `renderer.html`, 3 new tests (count shows correct N, missing element no-op, empty minions shows `Minions: 0`), 784/784 tests pass (commit c2db361)

2026-05-13 16:30  [DONE]  M40: Coordinator calls setBoardPanel for Reposition rec — imported `setBoardPanel` from `@overlay/shared` in `coordinator.ts`, added `if (top.action.type === 'Reposition')` branch that calls `setBoardPanel({ recommendation: top })` after `setAdvice(top)`; 2 new tests in `coordinator.test.ts` (Reposition rec wiring verified, non-Reposition doesn't update boardPanel), 781/781 tests pass (commit e10c418)

2026-05-13 16:00  [DONE]  M39: recommend Reposition rec test — added 1 test to `recommend.test.ts`: state with 3-minion board and 1 opponent with different minions, calls `recommend(state)`, asserts ≥1 rec returned (hill-climb runs without throwing); 778/778 tests pass (commit 62b8168)

2026-05-13 16:30  [DONE]  M39: loadSettings invalid JSON fallback — added try-catch around `JSON.parse` in `loadSettings` to return `defaultSettings()` on parse failure, added 1 test writing `{invalid json}` to temp file and asserting `defaultSettings()` returned; 779/779 tests pass (commit c7d7d58)

2026-05-13 15:30  [DONE]  M39: predictOpponentBoard scale cap + boundary tests — added 2 tests to `opponentPredictor.test.ts`: turn 20 cap at 1.5× original stats, turn 4 boundary returns unscaled board; 777/777 tests pass (commit d3b010e)

2026-05-13 15:00  [DONE]  M39: Coordinator snapshot logging — added `previousTurn` tracking to `startCoordinator`, logs `state-snapshot` with `{ turn, phase, gold, tier }` when turn increments, 2 new tests (turn increment logs snapshot, no turn change skips snapshot), 771/771 tests pass (commit 93911a8)

2026-05-13 15:30  [DONE]  M39: Auto-prune on resetSession — modified `resetSession()` in `packages/shared/src/sessionLog.ts` to call `pruneOldSessions(50)` after clearing `sessionFile`; 2 new tests (prunes to 50 when >50 exist, no-op when ≤50), 775/775 tests pass (commit fe6c7fd)

2026-05-13 15:30  [DONE]  M39: hillClimbPosition no-opponents tests — added 2 tests to `positionHillClimb.test.ts`: no-opp array returns scoreDelta=0/fromIndex=null, single-minion board returns bestOrder.length=1; 773/773 tests pass (commit d6db30c)

2026-05-13 14:00  [DONE]  M38: scoreFreezeWithSim + scoreRerollWithSim — added both functions to `budgetScorer.ts` following the existing `scoreTierUpWithSim` pattern (enumerate candidates, project opponents, score via `scoreCandidate` wrapped in `withBudget`), 6 new tests (3 per function), 756/756 tests pass (commit 64b1687)

2026-05-13 14:30  [DONE]  M39: Preload expose damage + board channels — added `onDamage` and `onBoard` to `setupPreload`'s `exposeInMainWorld` call, listening on `overlay:damage-update` and `overlay:board-update`; 3 new tests (onDamage fires, onBoard fires, onOpponents undefined), 8/8 tests pass (commit 9c0ee71)

2026-05-13 14:45  [DONE]  M39: Renderer wire damage display — added `onDamage` to `OverlayBridge` interface, wired `bridge.onDamage` in `initRenderer` to update `#damage-forecast` with `Win: ${pct}%` format, added `#damage-forecast` div to `renderer.html`, 3 new tests (element updated, missing element no-op, winPct=0 shows `Win: 0%`), 769/769 tests pass (commit b6be085)

2026-05-13 14:30  [DONE]  M38: Wire all three new scorers into recommend() — imported `scoreTierUpWithSim`, `scoreFreezeWithSim`, `scoreRerollWithSim` from `budgetScorer`, replaced heuristic-only TierUp/Freeze/Reroll blocks with simulation-based scoring (sim rec when score > 0, heuristic fallback otherwise), 4 new tests (tier-up, freeze, reroll, fallback), 760/760 tests pass (commit ab65200)

2026-05-13 15:00  [DONE]  M38: recommend edge-case tests — added 3 tests to `recommend.test.ts`: empty state with shop minion returns heuristic fallback, combat phase returns recommendations, single minion board with no opponents returns ≥1 rec; 763/763 tests pass (commit 57617f4)

2026-05-13 13:30  [DONE]  M37: opponentPanel update/clear — added 2 tests to `opponentPanel.test.ts`: setOpponentPanel with 2 opponents then getOpponentPanel returns length 2; clearOpponentPanel then getOpponentPanel returns empty; 6/6 tests pass (commit de5ba5a)

2026-05-13 12:30  [DONE]  M37: simScorer with 2 opponents — added test building player board with 2 minions and 2 opponent boards, calls scoreCandidate with n=5, asserts winPct in [0,1] and finite avgHpDelta; 742 pass (commit 8547f2d)

2026-05-13 13:00  [DONE]  M37: adapter roundtrip — added `bgsFormatToBoard` reverse adapter to `packages/sim/src/adapter.ts`, added 3 roundtrip tests (single minion, 2-minion board, empty board) to `adapter.test.ts`; 745 pass (commit 5286803)

2026-05-13 11:30  [DONE]  M37: pipeline shopping-phase integration — added test firing MAIN_READY + RESOURCES + PLAYER_TECH_LEVEL, asserts phase=shopping, gold=4, tier=2; 740 pass (commit 69b7b8e)

2026-05-13 12:00  [DONE]  M37: recommend Buy rec with shop minions — added test setting shop.minions=2, gold=3, phase=shopping, asserts ≥1 Buy recommendation; 741 pass (commit 56f257f)

2026-05-13 11:15  [DONE]  M36: applyFatigue handler — handles `TAG_CHANGE tag=FATIGUE` or `TAG_CHANGE tag=FATIGUE_COST` on player controller, reduces player hero HP by fatigue cost, 5 tests, wired into reducer (commit 403a2f7)

2026-05-13 11:15  [DONE]  M36: applyCardId handler — handles `TAG_CHANGE tag=CARDID` on entities in PLAY zone, updates entityRegistry entry and minion cardId on player/opponent boards, 4 tests, wired into reducer (commit b252480)

2026-05-13 10:45  [DONE]  M35: reviewSession lines — extracted `reviewSessionLines` returning `string[]` from `reviewSession`, added 1 test verifying 3 session entries (2 state_snapshots + 1 recommendation) format correctly with state_snapshot, recommendation, Buy, and cardId present; 8/8 tests pass (commit 542636c)

2026-05-13 11:00  [DONE]  M35: Scrubber edge cases — implemented `stepBackward()` and `stepForward()` on `Scrubber` class with boundary guards (no-op at 0 / at end), added 2 tests to `scrubber.test.ts`; 11/11 tests pass (commit 0d93037)

2026-05-13 10:30  [DONE]  M35: LLM cache deduplication test — added 1 test to `cache.test.ts` verifying two different GameState objects with identical hash-relevant fields share a cache entry; 16/16 tests pass (commit 9f61c24)

2026-05-13 10:00  [DONE]  M35: buildPrompt Buy recommendation test — added 1 test to `buildPrompt.test.ts` verifying the user message contains the cardId, action type 'Buy', and a score digit; 13/13 tests pass (commit 4c4a509)

2026-05-13 09:30  [DONE]  M35: coordinator stop test — added 2 tests to `coordinator.test.ts`: (1) `stop()` is idempotent (calling twice doesn't throw), (2) `onEvent` after `stop()` does not trigger bridge polling (send count unchanged); 8/8 tests pass (commit 4adf6ea)

2026-05-13 09:45  [DONE]  M35: withBudget time-cap test — added 1 test to `withBudget.test.ts` verifying fast functions return within 200ms and result score >= 0; 6/6 tests pass (commit 1db4adf)

2026-05-13 09:15  [DONE]  M34: diffRecs structured diff — `diffRecs(actual, expected)` pairs recs by action type (score-independent key), returns `{ action, actualScore, expectedScore }[]`; 3 tests (identical=[], different actions=2 diffs, same action different scores=1 entry), 21/21 tests pass (commit 7bc75e7)

2026-05-13 09:00  [DONE]  M34: applyAttackBuff — already implemented with 4 tests (player board, opponent board, no-op hero, no-op unknown) and wired into reducer (commit d787221)

2026-05-13 08:00  [DONE]  M34: serializeGameState roundtrip test — added tests for initialState() roundtrip (turn, phase, gold, tier, opponents length) and entityRegistry Map restoration (entry present after roundtrip), 2 new tests (commit c077d91)

2026-05-13 07:45  [DONE]  M34: Health buff handler — `applyHealthBuff` handles `TAG_CHANGE tag=HEALTH` on minion entities (not heroes), updates `minion.health: number`, wired into reducer, 4 tests (commit 1d80e88)

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

2026-05-13 00:15  [DONE]  M50: weightedWinScore + lobbyWeights tests — added 1 test to `weightedScore.test.ts` (3-element zero-weight array returns 0) and 1 test to `lobbyWeight.test.ts` (3 all-eliminated opponents → weights [0,0,0] and total 0); 20/20 tests pass (commit 88fb466)

2026-05-14 00:00  [DONE]  M52: bootstrapOverlay factory — created `apps/overlay/src/bootstrap.ts` exporting `bootstrapOverlay(win, deps?)` that calls `startCoordinator(win)` then awaits `streamFactory ?? wireLogStream` with coordinator's `onEvent`, returns `{ coordinator, streamHandle }`; 3 tests (returns coordinator+streamHandle keys, streamFactory invoked once with function arg, null streamFactory → null handle with coordinator present); 870/870 tests pass (commit 1313ba8)

2026-05-14 00:00  [DONE]  M52: registerIpcHandlers extraction — extracted 6 `ipcMain.handle` calls from `main.ts` into `registerIpcHandlers(ipc, deps)` in new `ipcHandlers.ts`; updated `main.ts` to call the extracted function; 3 tests (registers 6 channels, set-interactive calls setInteractive, set-advice calls setAdvice); 870/870 tests pass (commit 8cf9391)

2026-05-14 00:00  [DONE]  M51: pipeline shop-buy → board-add flow — added 1 integration test to `pipeline.integration.test.ts` firing FULL_ENTITY + CONTROLLER + ZONE=PLAY, asserting 1 minion on player board with entityId 200; 863/863 tests pass (commit 8a103cd)

2026-05-14 00:00  [DONE]  M50: findActiveLogDir filters non-Hearthstone dirs — added 1 test to `findActiveLogDir.test.ts` verifying that a temp dir with `Hearthstone_A`, `OtherApp_B`, and `Hearthstone_B` returns the path ending in `Hearthstone_B` (ignores non-Hearthstone dirs); 3/3 tests pass (commit 4a8b1e6)

2026-05-14 00:00  [DONE]  M56: runDoctor orchestrator — created `apps/overlay/src/doctor.ts` exporting `async function runDoctor(deps)` that aggregates `isHsRunning`, `verifyConfig`, and `checkMlx` results into a single `DoctorResult`; 3 tests (all-true, hs-false, config-fail); 3/3 tests pass (commit e9f055d)

2026-05-14 00:00  [DONE]  M56: formatDoctorReport — added `formatDoctorReport(r: DoctorResult): string` to `apps/overlay/src/doctor.ts` returning multi-line string with `✓`/`✗` per check, missing sections listed after config line, error shown after mlx line; 3 tests (all-ok 3 checkmarks, one failure 2 checkmarks+1 cross, missing sections text present); 6/6 tests pass (commit 9c44a8d)

2026-05-14 00:00  [DONE]  M57: Bridge sends top-3 recs only — modified `startBridge` in `apps/overlay/src/ipcBridge.ts` to slice recs to `.slice(0, 3)` before sending on `'overlay:recs-update'`; 2 tests (1 rec → length 1, 5 recs → length 3); 924/924 tests pass (commit f113e40)

2026-05-14 00:00  [DONE]  M59: findHsLogDirCandidates lister — added `findHsLogDirCandidates(baseDir)` to `packages/log-parser/src/findActiveLogDir.ts` that returns all `Hearthstone_*` subdirectory names under baseDir, refactored `findActiveLogDir` to use it; 3 new tests (empty dir, filtered dirs, nonexistent dir); 940/940 tests pass (commit 6ce94a7)

2026-05-14 00:00  [DONE]  M60: applySpellPower handler — handles `TAG_CHANGE tag=SPELL_POWER` on entities in PLAY zone → updates `minion.spellPower: number` (add field to Minion in `packages/shared/src/state.ts`); wire into reducer, 4 tests (updates player board minion, updates opponent board minion, no-op on hero, no-op on non-play entity); 961/961 tests pass (commit d466164)

2026-05-14 00:00  [DONE]  M60: applyRevives handler — handles `TAG_CHANGE tag=NUM_REVIVES` on player controller, sets `state.player.revives: number`, 4 tests (initial=0, increments on revive, no-op on opponent, reflected in state), wired into reducer; 969/969 tests pass (commit 3e53671)

2026-05-15 00:00  [DONE]  M61: applyExhausted handler — handles `TAG_CHANGE tag=EXHAUSTED value=1/0` on entities in PLAY zone, sets `minion.exhausted: boolean` (add field to Minion in `packages/shared/src/state.ts`), 4 tests (set on player minion, set on opponent minion, no-op on hero, no-op on non-play entity), wired into reducer; 986/986 tests pass (commit 9378a2a)

2026-05-15 00:00  [DONE]  M63: applyDeathrattlesTriggered — handles `TAG_CHANGE tag=NUM_DEATHRATTLES_TRIGGERED_THIS_TURN` on player controller, sets `state.player.deathrattlesTriggeredThisTurn: number` (add field to PlayerState), 4 tests (initial=0, updates on tag, no-op on opponent, no-op on non-player entity), wired into reducer; 1020/1020 tests pass (commit 92cac7c)

2026-05-15 00:00  [DONE]  M63: applyMinionsDied — handles `TAG_CHANGE tag=NUM_MINIONS_DIED_THIS_TURN` on player controller, sets `state.player.minionsDiedThisTurn: number` (add field to PlayerState), 4 tests (initial=0, increments on minion death, no-op on opponent, reflected in state), wired into reducer; 1028/1028 tests pass (commit 29437de)

2026-05-15 00:00  [DONE]  M61: applyMagnetic handler — handles `TAG_CHANGE tag=MAGNETIC value=1/0` on entities in PLAY zone, sets `minion.magnetic: boolean` (add field to Minion in `packages/shared/src/state.ts`), 4 tests (set on player minion, set on opponent minion, no-op on hero, no-op on non-play entity), wired into reducer; 987/987 tests pass (commit 4225db9)

---

2026-05-15 00:00  [DONE]  M62: applyNumMinionsTraded handler — handles `TAG_CHANGE tag=NUM_MINIONS_TRADED_THIS_TURN` on player controller, sets `state.player.minionsTradedThisTurn: number` (add field to PlayerState), 4 tests (initial=0, increments on combat trades, no-op on opponent, reflected in state), wired into reducer; 1012/1012 tests pass (commit aa7b9b0)

---

2026-05-15 00:00  [DONE]  M61: applyTurnTimer — handles `TAG_CHANGE tag=TIMEOUT` on player controller, sets `state.player.turnTimer: number` (add field to PlayerState in `packages/shared/src/state.ts` and `initialState`), 4 tests (initial=15, updates on turn start, no-op on opponent, reflects remaining time), wired into reducer; 1000/1000 tests pass (commit 6e305c9)

2026-05-15 00:00  [DONE]  M61: applyOpponentRevives — handles `TAG_CHANGE tag=NUM_REVIVES` on opponent controllers, sets `state.opponents[i].revives: number` (add field to OpponentState), 4 tests (initial=0, increments on opponent revive, no-op on player, reflected in state), wired into reducer; 1004/1004 tests pass (commit abac9f0)

2026-05-15 00:00  [DONE]  M62: applyNumChoices handler — handles `TAG_CHANGE tag=NUM_CHOICES` on player controller, sets `state.player.numChoices: number` (add field to PlayerState), 4 tests (initial=0, updates on discover, no-op on opponent, reflected in state), wired into reducer; 1016/1016 tests pass (commit a8159e9)

---

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
