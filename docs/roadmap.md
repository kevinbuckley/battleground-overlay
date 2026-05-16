# Battleground Overlay — Live-Game Review and Roadmap

Date: 2026-05-15. After today's first end-to-end live testing during real
Battlegrounds matches with the user. Goal of this document: an honest
assessment of what worked and what didn't, plus a phased plan to evolve
the overlay into a reliable, trustworthy BG assistant.

---

## TL;DR

Today the overlay went from "doesn't launch" to "renders a transparent panel
on top of HS that ingests live `Power.log` events and produces
recommendations." That's real progress. But the recommendations were
nearly useless because three layers all have substantial gaps:

1. **State model** — the player's board count was usually 0–2 instead of
   the real 4–7. Opponents were ghosts; only the current combat opponent
   was tracked.
2. **Advisor** — out of 22,106 recommendations in one session, only
   *two* action types ever appeared (`Sell`, `TierUp`). The simulator is
   wired in but is initialised with **zero card data**, so every sim
   returns `winPct ≈ 0` and the heuristic for `TierUp` dominates
   everything.
3. **UX** — the panel shows raw card IDs (`BG34_63`), uses meaningless
   slot indices (`Sell #0`), flickers every 500 ms, and gives no visual
   cue tying the advice to the actual minion or shop slot.

None of these are individually hard. But they have to be fixed in a
specific order, and **we cannot iterate safely until we have replay
fixtures** (a real Power.log captured during a real match) to assert
against. Without that we keep regressing.

---

## What worked today

- **Bootstrap path** runs end-to-end: doctor → anchor → log-stream wire
  → IPC bridge → renderer.
- **Log-rotation following** — the overlay now detects when HS writes a
  new session dir mid-run and switches its tail to the newer
  `Power.log`.
- **Player identity resolution** via `PLAYER_INFO` and `PLAYER_NAME`
  parsers. This unblocked tier/gold tracking.
- **Authoritative turn counter** from `GameEntity NUM_TURNS_IN_PLAY`
  instead of incrementing on every `STEP=MAIN_READY`.
- **Card data downloaded** (34,954 cards) — `getCardById` now resolves.
  The advisor still doesn't pass them to the sim, but the data is on
  disk.
- **Always-on-top above HS** with `setAlwaysOnTop(true, 'screen-saver')`
  and `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })`.
- **Preload ↔ renderer wiring** (both modules previously defined
  `setupPreload` / `initRenderer` but never called them — fixed).
- **Self-recovering parser** — strips the HS log-line prefix
  (`D HH:MM:SS.NNNNNNN GameState.DebugPrintPower() - `) before
  per-event parsers run; previously zero events parsed, now hundreds.

## What didn't work (live-observed)

| # | Observation | Real cause |
|---|---|---|
| 1 | "Sell #0" repeated on every turn for ~half the game | Sim returns 0 winPct (empty cards DB), TierUp heuristic dominates, Sell falls back to weakest-by-stats with no synergy → indistinguishable each turn |
| 2 | Board minion count was 0–2 when reality was 6 | `applyMinionRemoved` over-removed during combat resolution (ZONE→GRAVEYARD/REMOVEDFROMGAME); fix made it a no-op which now under-removes (sells/destroys not honored) |
| 3 | Card stats showing `0/0` | Card-data lookup returned null (cards.json wasn't downloaded); fixed mid-session by curling the JSON, but multi-tribe minions and buffs still show as base-stat |
| 4 | Card names showing as raw IDs (`BG34_63`) | Shop minion payload omits `name` (board does enrich, shop doesn't); `SellAction` drops `cardId` entirely |
| 5 | Turn counter was 24 in a real ~7-turn game | `STEP=MAIN_READY` incremented turn many times per real turn; fixed |
| 6 | "Opponents: 1" when BG has 8 players | We only register opponents on `PLAYER_INFO`, which only fires for the current combat opponent |
| 7 | New BG match within same HS session didn't reset state | Reset was hooked to `TB_BaconShop_StartGame` trigger, which doesn't appear in this client; switched to `PLAYER_INFO` identity-change |
| 8 | Power.log went silent for 5+ minutes mid-game | HS stopped flushing the Power channel after a crash-recovery; required full HS quit/restart |
| 9 | Initial overlay launches showed empty panel | `preload.ts` defined `setupPreload` but never invoked it → `window.overlayBridge` undefined |
| 10 | Shop never populated in our model | `applyShopRefresh` is only called on `ZONE_CHANGE_LIST`, but real client emits per-slot `TAG_CHANGE` — we never see the refresh |

The pattern is clear: **the HS event flow we model assumes a clean
"standard" 2-player game; BG's real flow is messier and more
multi-zone. Every layer of the stack has to be revisited with that in
mind.**

---

## Root causes (deeper)

### 1. No replay fixtures

This is the meta-bug. Without a recorded `Power.log` from a real BG
match committed to the repo, every fix is a guess. Today we made and
reverted three different versions of `applyMinionRemoved` because we
couldn't tell which one matched real BG behavior. **Phase 0 of the
roadmap is "capture fixtures" — nothing else can be reliable until that
exists.**

### 2. State model bakes in HS-standard assumptions

A non-exhaustive list of places where standard-HS thinking breaks BG:

- `applyMinionPlaced` filters board adds to `priorZone === 'HAND'`. True
  for buys, false for combat survivors that come back PLAY → PLAY.
- `applyMinionRemoved` removes on `GRAVEYARD`/`REMOVEDFROMGAME`. BG uses
  these mid-combat for survivors that come back.
- `applyTripleBonus`, `applyTrinket` hardcode `controller === 1`. The
  player is `playerId 1..8` randomly per match.
- `applyAnomaly`, `applyGameTurn` check `entityId === player.entityId`,
  but those tags live on `GameEntity`.
- `applyHeroPower` triggers on a cumulative counter (`NUM_TIMES_HERO_POWER_USED_THIS_GAME`)
  but treats it as a per-turn flag — sticky from turn 2 onward.
- The shop is populated by `ZONE_CHANGE_LIST`, but real refreshes come
  through individual `TAG_CHANGE ZONE=SETASIDE → PLAY`.
- Opponent slots are appended on `PLAYER_INFO`, but BG only emits one
  `Player ...` line per current combat opponent.

### 3. Advisor's sim path is decorative, not functional

Confirmed during today's audit:

- `simulateBatch.ts:16` calls `cardsService.initializeCardsDbFromCards([])`.
  Firestone's BG simulator looks up card mechanics by ID; with an empty
  DB every minion is a vanilla stat-only blob and no triggers, deathrattles,
  divine shields, magnetics, or auras resolve correctly. **Result:
  every sim returns essentially zero signal.**
- `seed?: number` is plumbed through but never passed into
  `BgsBattleOptions`. Adjacent recommendations on the same state can
  produce different answers.
- `oppDelta = wins * opp.tier - losses * playerState.tier` (`simScorer.ts:55`)
  is not HP delta — it's a tier-weighted W/L proxy. Firestone's
  `averageDamageWon`/`averageDamageLost` are computed and discarded.
- `lobbyWeight.ts` exists and is exported but is never called from
  `recommend.ts`.

The TierUp heuristic produces 0.8–1.0 from turn 4 onward; the Buy
heuristic produces 0 unless the player already has a triple-in-progress
or two minions of the same tribe. So `recommend()` always picks TierUp.

### 4. UX has no visual hierarchy and no advice↔element binding

The user sees `Sell #0` and has to mentally translate "slot 0" into
"the leftmost minion on my actual board." The advice list and the board
list are in the same panel but not visually linked. There are no icons,
no tribe glyphs, no color coding by action type. The panel updates
every 500 ms even when nothing changed (poll, not push).

### 5. Tooling/process gaps

- No `bun typecheck` or `bun test` was run during this iteration — we
  shipped multiple changes without verifying. The autonomous loop has
  these gates; live-iteration mode skipped them.
- No way to capture a screenshot for verification while the overlay is
  running (sandbox limitations on `screencapture`; computer-use
  permission for the Electron process kept timing out).
- Settings are file-based only; no in-panel controls for opacity /
  position / show-hide sections.

---

## Roadmap

Five phases. Each phase has a **completion gate** — we don't move on
until that gate is green. Phases overlap in places where the work is
genuinely independent.

### Phase 0 — Validation infrastructure (1–2 days)

The pre-requisite for all other work. Today we kept guessing because we
couldn't replay.

- **0.1** Capture and commit a complete BG match `Power.log` to
  `fixtures/`. Strip player names but keep entity IDs and BG-specific
  tags. Aim for ~5–8 MB.
- **0.2** Build `scripts/replay-fixture.ts` — replays a fixture through
  `createPipeline()` and prints turn-by-turn `GameState` snapshots. Use
  this for hand-validating fixes against the user's recollection.
- **0.3** Write the first replay-test: assert that at "turn 6 shopping"
  the player has the expected number of board minions and tier. Even
  approximate assertions catch big regressions.
- **0.4** Add a `--debug-state` flag to the overlay that writes a
  per-turn JSONL diff of `GameState` next to the session log. Makes
  post-game forensic review possible.

**Gate:** we can replay a real match and the script doesn't throw, and
one assertion test passes. Future state-model changes must keep that
test green.

### Phase 1 — State-model accuracy (3–5 days)

Now we can finally make state correct.

- **1.1** Pre-register all 8 lobby players up front on game start.
  Stop dedup-by-`playerId`; reset `opponents` to 7 stub slots indexed
  1..8 minus local player.
- **1.2** Re-enable `applyMinionRemoved` with a combat-aware guard:
  track `inCombat` flag (set on `STEP=MAIN_COMBAT`, cleared on
  `STEP=MAIN_CLEANUP`). Ignore GRAVEYARD/REMOVEDFROMGAME during combat;
  honor outside.
- **1.3** Snapshot-rebuild after combat: when STEP transitions out of
  MAIN_COMBAT, walk the entity registry and rebuild
  `state.player.board.minions` from `{controller=playerId, zone=PLAY,
  cardId is a real minion}` rather than relying on incremental
  add/remove.
- **1.4** Apply the same trick to opponent boards from the
  opponent-board reveal sequence at combat start
  (`SHOW_ENTITY` events, currently dropped because
  `heroIdentify.ts:5` early-returns on non-`Hero_*` cards).
- **1.5** Switch shop refresh from `ZONE_CHANGE_LIST` to also dispatch
  on `priorZone=SETASIDE → value=PLAY` for player-controlled entities;
  push into `state.player.shop.minions`.
- **1.6** Add `zonePos` and live `attack`/`health` to `EntityInfo` so
  shop slots have position and buffed minions show real stats.
- **1.7** Fix hardcoded `controller === 1` in `tripleBonus.ts` and
  `trinket.ts` → use `state.player.playerId`.
- **1.8** Anchor `anomaly`, `gameTurn`, `numGameTurns` to
  `event.entity === 'GameEntity'` instead of `state.player.entityId`.
- **1.9** Fix `applyHeroPower` to delta-track the cumulative counter so
  `heroPowerUsedThisTurn` resets per turn.
- **1.10** Add parsers for `HIDE_ENTITY`, `CHANGE_ENTITY`,
  `CREATE_GAME`, `META_DATA`, `OPTIONS`/`SendChoices` —
  required for shop teardown, opponent reveals, discover offers, hero
  mulligan.
- **1.11** Track `BACON_NEXT_OPPONENT_PLAYER_ID` and
  `BACON_LAST_OPPONENT_PLAYER_ID` so the advisor knows who you'll fight
  next (the entire point of pre-combat advice).

**Gate:** running the Phase 0 fixture, the model agrees with reality
within ±1 minion at every shopping-phase snapshot, lobby shows 8
players, opponent boards are visible after at least one combat each.

### Phase 2 — Advisor: real recommendations (2–4 days)

Once state is trustworthy, the advisor can actually do its job.

- **2.1** **Fix the empty cards DB.** Single line in
  `packages/sim/src/simulateBatch.ts:16`:
  `cardsService.initializeCardsDbFromCards(loadCards())`. Most likely
  to unlock Buy/Freeze/Reroll/Reposition recs immediately.
- **2.2** Use Firestone's `averageDamageWon`/`averageDamageLost` for
  real damage-projection scoring, not the tier-weighted W/L proxy.
- **2.3** Pass `seed` into `BgsBattleOptions` so adjacent
  recommendations don't oscillate.
- **2.4** Wire `lobbyWeight` into `simScorer.scoreCandidate` so the rec
  optimizes against opponents you're actually likely to fight (weight
  by `opp.hero.hp / totalAliveHp`, with a 2× boost for "next opponent"
  if known).
- **2.5** Cap `tierCurveScore` below 0.9 when board is empty and below
  0.7 when a triple-in-progress is in shop. Forces actual competition
  with other actions.
- **2.6** Multi-tribe shop minions: `card-data/loadCards.ts` should
  read `races: string[]` from HearthstoneJSON; `shopRefresh.ts` should
  write the array. Tribe synergy heuristic should weight by *all*
  applicable tribes.
- **2.7** **Templated reasons.** Replace the 12 static reason strings
  with templates that interpolate cardName, winPct, opponent tier:
  ``Buy ${cardName} — ${(winPct*100|0)}% vs ${alive} opponents``.
- **2.8** Add `cardId` to `SellAction` so the renderer can show
  "Sell Murloc Tidehunter (slot 1)" instead of "Sell #0".
  (`recommend.ts:89`, `candidates.ts:85`.)
- **2.9** Reposition: replace 1-swap hill-climb with exhaustive
  permutation under a budget (≤7 minions = 5040 perms; trivially
  budgetable).

**Gate:** in a fresh fixture replay, the advisor produces at least 4 of
{Buy, Sell, Freeze, Reroll, TierUp, Reposition} action types over the
course of one match, and at least one Buy is recommended in turns 1–3.

### Phase 3 — UX: actionable, calm, beautiful (3–5 days)

Make the recs glanceable.

- **3.1** Push, don't poll. Drop the 500 ms `setInterval` in
  `ipcBridge.ts`; have `coordinator.onEvent` push when
  `recommend()` returns a different top action OR state changes
  meaningfully (turn, gold, board count). Eliminates flicker.
- **3.2** Diff-cache before send: hash each payload, only `webContents.send`
  on change.
- **3.3** Hold last-good action card for ≥1.5 s before swapping; if the
  new top has the same `(type, cardId/boardIndex)`, update score in
  place rather than rebuilding.
- **3.4** New layout — see ASCII mockup in
  [`docs/ux-redesign.md`][ux-redesign] (TBD). Header strip with
  T/phase/gold/tier/HP; hero action card with colored left border by
  action type; alt-actions row; board / shop / combat-forecast /
  lobby panels.
- **3.5** Bind advice to game element: render `<li data-slot="N">` in
  board/shop lists; the recommendation carries `targetSlot` and the
  renderer applies a highlight class.
- **3.6** Tribe glyphs (emoji or SVG) instead of tribe text.
- **3.7** Card-name everywhere (currently shop list shows raw IDs).
- **3.8** Hide "Best: 0/0" until stats are populated.
- **3.9** Drop debug remnants (`bridge: connected`, `OVERLAY ALIVE`).
  Auto-clear startup banner after 8 s.
- **3.10** In-panel settings popover (gear icon): opacity slider,
  show/hide section toggles, "move mode" hotkey to drag-reposition.

**Gate:** during a real match, the user can act on every top
recommendation without looking back at the panel a second time, and
the panel doesn't change visibly more than 2× per real turn.

### Phase 4 — Strategy depth (open-ended)

The substrate is now correct. Time to make the advice *good*.

- **4.1** Hero-aware tier curves. Patchwerk plays slower than
  Bartendotron; the static `idealTurn` table doesn't know that.
- **4.2** Anomaly-aware behavior. Several anomalies fundamentally
  change tier-up math (cheap upgrades, free rerolls, etc.).
- **4.3** Tribe-availability awareness. BG randomizes 5 of 8 tribes
  per lobby; the advisor should know which tribes are pickable and
  weight synergies accordingly.
- **4.4** Trinket-aware advice. Trinkets are now a major axis of BG
  strategy. The advisor should know which trinkets are on the board
  and weight buys / repositions accordingly.
- **4.5** Lobby-meta awareness. If three players in the lobby are
  going Naga, your Murloc value drops.
- **4.6** "Panic mode." When `hero.hp < 12`, pivot from tempo to
  stats: cap TierUp / Greed scores, boost defensive Buys / Freezes.
- **4.7** Better opponent prediction. Replace the
  `(turn-4)*0.1` linear stat scaling with archetype-sampling: from
  recorded games, given `(hero, tier, turn, tribe)` sample a
  representative board.
- **4.8** Multi-turn lookahead. Right now the advisor optimizes the
  current shopping turn in isolation. A 2-turn lookahead with discount
  factor would catch "save gold for a turn 6 power spike" plays.
- **4.9** Optional: reinforcement-learn the heuristic weights against
  recorded user games.

**Gate:** subjective — user reports the advice as "actually good" in a
sample of 5 matches across different heroes/anomalies.

### Phase 5 — Polish & longevity (ongoing)

- **5.1** Patch tracking. New BG patches change cards weekly. Pin a
  patch hash in `card-data`; on launch, doctor checks for newer patches
  and prompts.
- **5.2** Hot-reload of card data without restart.
- **5.3** Post-game review tool. Replay a session JSONL with the
  current advisor and show "what should I have done on turn 8?" — this
  is what `apps/replay` is for, currently a stub.
- **5.4** Telemetry (opt-in, local-only): record advice accepted vs
  ignored, feed into heuristic tuning.
- **5.5** Multi-monitor / multi-Space support — already partially
  there with `setVisibleOnAllWorkspaces`, but needs testing.
- **5.6** Auto-update mechanism for the overlay itself.

---

## Sequencing

```
Phase 0  (validation)        █████
Phase 1  (state)                  ████████████
Phase 2  (advisor)                          ████████
Phase 3  (UX)                                    ████████
Phase 4  (strategy)                                       ████████████....
Phase 5  (polish)                                                 ............
        |   |   |   |   |   |   |   |   |   |
        d1  d2  d3  d4  d5  d6  d7  d8  d9  d10
```

Phases 1 and 2 can overlap once the empty-cards-DB fix in 2.1 is done
(it's a 1-line change). Phase 3 can start in parallel with the second
half of Phase 1 since most UX work is renderer-side and doesn't need
state to be perfect first.

## What I'd do tomorrow morning

If I had only one day to make the biggest impact:

1. **Commit a real Power.log fixture** (Phase 0.1).
2. **Fix `simulateBatch.ts:16` empty cards DB** (Phase 2.1) — one line,
   probably unlocks 4 new action types.
3. **Templated reasons** (Phase 2.7) — half hour, immediate UX win.
4. **Add `cardId` to `SellAction` and pass through to renderer** (2.8) —
   so "Sell #0" becomes "Sell Murloc Tidehunter."
5. **Push-not-poll bridge** (3.1) — eliminates the visible flicker.

Each one is small, each one is the highest-leverage thing in its area.

---

## Open questions for the user

1. Are you willing to run one full BG match with `bun run dev:overlay`
   and `tail -f` the Power.log so I can capture a clean fixture for
   `fixtures/`?
2. How much do you care about competitive accuracy vs. casual
   "interesting suggestions"? Affects how much we invest in Phase 4.
3. Anomalies / Trinkets / Quests / Buddies — which BG sub-systems do
   you actually engage with? We can deprioritize ones you skip.
4. Should the LLM (Qwen at `localhost:8080`) write the explanations
   from a structured action context, or stay decorative? Today it ran
   on `needsExplanation=true`, which was rarely set.

[ux-redesign]: ./ux-redesign.md
