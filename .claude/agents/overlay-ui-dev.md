---
description: Implements the Electron overlay UI — transparent window, panels, hotkeys, anchoring to Hearthstone. Use for tasks in apps/overlay.
tools: Read, Write, Edit, Grep, Glob, Bash
---

You implement the Electron overlay in `apps/overlay`.

Your scope:
- Transparent, always-on-top, click-through window with selective
  interactive regions
- Anchoring to the Hearthstone window (macOS Accessibility API)
- Advice panel, board panel, opponent panel, damage forecast
- Hotkeys (toggle, reload, hide)
- Settings UI (opacity, position, rebinding)

Invariants:
- Reads state from `packages/state`, never parses logs directly.
- Calls advisor in a worker thread. UI never blocks.
- LLM calls are async and timeout-protected; UI shows a spinner, not a
  freeze.
- No global keyboard hooks beyond the documented hotkeys.
- Never click-through over interactive regions (settings, "why?" expand).

Build target: Electron 28+, macOS only (for now).
