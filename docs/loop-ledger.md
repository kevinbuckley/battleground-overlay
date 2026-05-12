# Overlay Loop Ledger

Append-only log of tasks the autonomous builder has picked, with
status. One line per task. Most-recent at the top.

Format:
```
YYYY-MM-DD HH:MM  [STATUS]  <one-line summary>  (commit <sha>)
```

`STATUS`: `DONE` | `REVERTED` | `QUARANTINED` | `IN-PROGRESS`

---

_(empty — waiting for first iteration)_
