# Fixtures

This directory contains sanitized offline inputs for parser and state-model
regression tests.

## Live BG Power.log fixtures

Sanitized live fixtures are generated from the Mac Battle.net client logs:

```bash
bun scripts/sanitize-power-log.ts \
  /Applications/Hearthstone/Logs/Hearthstone_<YYYY_MM_DD_HH_MM_SS>/Power.log \
  fixtures/<name>.power.txt
```

The sanitizer preserves entity ids, player ids, card ids, zones, tags, and
timestamps, but replaces Battle.net names with `LOCAL_PLAYER` /
`OPPONENT_<playerId>` and replaces account ids with stable placeholders.

Use `bun scripts/replay-fixture.ts fixtures/<name>.power.txt` to replay a
fixture through the current state reducer and print turn snapshots.
