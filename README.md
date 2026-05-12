# Battleground Overlay

Real-time advice overlay for live Hearthstone Battlegrounds on macOS.

Reads `Power.log` from the Battle.net client, builds a live game-state
model, runs heuristic + simulation search, and renders prescriptive
advice (buy / sell / freeze / reroll / tier / position) on a
transparent always-on-top window.

**Status:** harness only — no app code yet. An autonomous builder
agent works through [docs/loop-backlog.md](docs/loop-backlog.md) to
produce the actual app.

## Quick start (for the builder agent)

1. Read [CLAUDE.md](CLAUDE.md).
2. Read [docs/architecture.md](docs/architecture.md).
3. Open [docs/loop-backlog.md](docs/loop-backlog.md), pick the top
   unblocked `[S]` or `[M]` task not already in
   [docs/loop-ledger.md](docs/loop-ledger.md) and not quarantined.
4. Implement. Run `bun test` && `bun typecheck`. Commit.
5. Tick the backlog box, append a line to the ledger.
6. Loop.

## Quick start (for the human)

To have Claude run the autonomous loop with periodic check-ins, say
in any Claude session: **"run the overlay loop"**.

The `overlay-loop` skill at `.claude/skills/overlay-loop/SKILL.md`
takes it from there — starts `scripts/loop.sh` and re-checks every
30 minutes via ScheduleWakeup until you say "stop".

For the skill to be discoverable from any Claude session (not just
when cwd is this repo), symlink it into your user skill directory:

```bash
mkdir -p ~/.claude/skills
ln -s /Users/kbux/code/battleground-overlay/.claude/skills/overlay-loop \
      ~/.claude/skills/overlay-loop
```

## Scripts

```bash
./scripts/start-mlx-server.sh    # bring up Qwen3 on :8080 (needed by loop)
./scripts/enable-hs-logging.sh   # write Hearthstone log.config (once)

./scripts/loop.sh                # run the autonomous builder loop
./scripts/loop.sh --iters 5      # bounded run for testing
./scripts/loop.sh --debug --iters 1   # one iter, full output

./scripts/stop-loop.sh           # graceful stop after current iter
./scripts/stop-loop.sh --force   # immediate kill
```

Once M0–M2 are done you'll also be able to:

```bash
bun install
bun run dev:replay fixtures/turn-1-bootstrap.log
```

The Electron overlay (`bun run dev:overlay`) becomes useful at M7.

## Stack

- Bun workspaces (TS strict, Biome)
- Electron 28+ for the overlay UI
- `@firestone-hs/simulate-bgs-battle` for combat sim (full
  current-patch coverage)
- HearthstoneJSON for card data
- Local MLX-hosted Qwen3.6-35B-A3B-4bit at `http://localhost:8080`
  for advice explanations (never in the deterministic path)

See [docs/architecture.md](docs/architecture.md) for details.
