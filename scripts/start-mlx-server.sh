#!/usr/bin/env bash
# start-mlx-server.sh — start the local Qwen3 server for the loop and the LLM layer.
# Uses mlx_lm.server, OpenAI-compatible, on port 8080.
set -euo pipefail

MODEL_PATH="${MLX_MODEL_PATH:-/Users/kbux/.cache/mlx/Qwen3.6-35B-A3B-4bit}"
PORT="${MLX_PORT:-8080}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$REPO/logs"
LOG="$REPO/logs/mlx-server.log"

if curl -s --max-time 2 "http://localhost:$PORT/v1/models" >/dev/null; then
  echo "MLX server already running at http://localhost:$PORT"
  exit 0
fi

if [[ ! -d "$MODEL_PATH" ]]; then
  echo "FAIL: model not found at $MODEL_PATH"
  echo "  set MLX_MODEL_PATH or download the model first"
  exit 1
fi

command -v mlx_lm.server >/dev/null 2>&1 \
  || { echo "FAIL: mlx_lm.server not in PATH (pip install mlx-lm)"; exit 1; }

echo "starting MLX server on :$PORT — log: $LOG"
nohup mlx_lm.server --model "$MODEL_PATH" --port "$PORT" >> "$LOG" 2>&1 &
PID=$!
echo "  PID: $PID"

# Wait for it to come up
for i in {1..30}; do
  if curl -s --max-time 1 "http://localhost:$PORT/v1/models" >/dev/null; then
    echo "  ready after ${i}s"
    exit 0
  fi
  sleep 1
done
echo "FAIL: server did not respond within 30s — check $LOG"
exit 1
