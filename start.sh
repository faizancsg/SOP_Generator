#!/usr/bin/env bash
# Start the SOP Generator (backend + frontend)
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Load .env if GEMINI_API_KEY not already set ──────────────
if [ -z "$GEMINI_API_KEY" ] && [ -f "$ROOT/backend/.env" ]; then
  export $(grep -v '^#' "$ROOT/backend/.env" | xargs)
  echo "Loaded GEMINI_API_KEY from backend/.env"
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo ""
  echo "ERROR: GEMINI_API_KEY is not set."
  echo ""
  echo "Fix: create the file backend/.env with this content:"
  echo "  GEMINI_API_KEY=your_key_here"
  echo ""
  echo "Get a free key at: aistudio.google.com"
  exit 1
fi

echo "GEMINI_API_KEY is set ✓"

# ── Backend ──────────────────────────────────────────────────
echo "Starting backend on http://localhost:8000 ..."
cd "$ROOT/backend"
pip3 install -r requirements.txt -q
GEMINI_API_KEY="$GEMINI_API_KEY" uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# ── Frontend ─────────────────────────────────────────────────
echo "Starting frontend on http://localhost:5173 ..."
cd "$ROOT/frontend"
npm install -q
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ SOP Generator running:"
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
