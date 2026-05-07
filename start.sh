#!/usr/bin/env bash
# Start the SOP Generator (backend + frontend)
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Backend ──────────────────────────────────────────────────
echo "Starting backend on http://localhost:8000 ..."
cd "$ROOT/backend"
pip3 install -r requirements.txt -q
GEMINI_API_KEY="${GEMINI_API_KEY:-}" uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
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
echo "  API docs → http://localhost:8000/docs"
echo ""
echo "Set GEMINI_API_KEY before starting for AI features:"
echo "  export GEMINI_API_KEY=your_key_here"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
