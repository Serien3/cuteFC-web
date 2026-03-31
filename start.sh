#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
VENV_DIR="$REPO_ROOT/.venv"
FRONTEND_DIR="$REPO_ROOT/frontend"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BOOTSTRAP_DEMO="${BOOTSTRAP_DEMO:-1}"
SKIP_INSTALL="${SKIP_INSTALL:-0}"
BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
PYTHON_BIN=""
BACKEND_PID=""
FRONTEND_PID=""

log() {
  printf '[cuteFC-gui] %s\n' "$1"
}

fail() {
  printf '[cuteFC-gui] %s\n' "$1" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

require_command() {
  local command_name="$1"
  local install_hint="$2"
  if ! command_exists "$command_name"; then
    fail "缺少依赖: ${command_name}。${install_hint}"
  fi
}

pick_python() {
  if command_exists python3; then
    PYTHON_BIN="python3"
    return
  fi
  if command_exists python; then
    PYTHON_BIN="python"
    return
  fi
  fail "未找到 Python 3。请先安装 Python 3.11+。"
}

ensure_venv() {
  if [ ! -x "$VENV_DIR/bin/python" ]; then
    log "创建虚拟环境 .venv"
    "$PYTHON_BIN" -m venv "$VENV_DIR"
  fi
}

install_python_dependencies() {
  log "安装 Python 依赖"
  "$VENV_DIR/bin/python" -m pip install --upgrade pip
  "$VENV_DIR/bin/python" -m pip install \
    fastapi \
    uvicorn \
    sqlalchemy \
    "pydantic>=2" \
    pytest \
    httpx \
    scipy \
    pysam \
    Biopython \
    numpy \
    pyvcf3 \
    scikit-learn
  "$VENV_DIR/bin/python" -m pip install -e "$REPO_ROOT/cuteFC" --no-deps
}

install_frontend_dependencies() {
  log "安装前端依赖"
  (cd "$FRONTEND_DIR" && npm install)
}

ensure_port_available() {
  "$VENV_DIR/bin/python" - "$1" <<'PY'
import socket
import sys

port = int(sys.argv[1])
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind(("127.0.0.1", port))
    except OSError:
        raise SystemExit(1)
raise SystemExit(0)
PY
}

wait_for_backend() {
  log "等待后端启动完成"
  "$VENV_DIR/bin/python" - "$BACKEND_PORT" <<'PY'
import sys
import time
import urllib.error
import urllib.request

port = int(sys.argv[1])
url = f"http://127.0.0.1:{port}/health"

for _ in range(120):
    try:
        with urllib.request.urlopen(url, timeout=1) as response:
            if response.status == 200:
                raise SystemExit(0)
    except urllib.error.URLError:
        time.sleep(1)

raise SystemExit(1)
PY
}

bootstrap_demo_data() {
  if [ "$BOOTSTRAP_DEMO" != "1" ]; then
    return
  fi

  log "注入内置 demo 数据"
  "$VENV_DIR/bin/python" - "$BACKEND_PORT" <<'PY'
import json
import sys
import urllib.request

port = int(sys.argv[1])
request = urllib.request.Request(
    f"http://127.0.0.1:{port}/demo/bootstrap",
    data=b"",
    method="POST",
)
with urllib.request.urlopen(request, timeout=10) as response:
    payload = response.read().decode("utf-8").strip()
    if payload:
        data = json.loads(payload)
        print(f"[cuteFC-gui] demo bootstrap: {data}")
PY
}

cleanup() {
  local exit_code=$?
  if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  wait >/dev/null 2>&1 || true
  exit "$exit_code"
}

trap cleanup EXIT INT TERM

main() {
  require_command bash "请在 Linux 或 macOS 的 shell 环境中运行此脚本。"
  require_command npm "请先安装 Node.js 20+（需包含 npm）。"
  pick_python

  if [ "$SKIP_INSTALL" != "1" ]; then
    ensure_venv
    install_python_dependencies
    install_frontend_dependencies
  else
    ensure_venv
  fi

  ensure_port_available "$BACKEND_PORT" || fail "端口 ${BACKEND_PORT} 已被占用，请先释放后端端口或改用 BACKEND_PORT。"
  ensure_port_available "$FRONTEND_PORT" || fail "端口 ${FRONTEND_PORT} 已被占用，请先释放前端端口或改用 FRONTEND_PORT。"

  log "启动后端: http://${BACKEND_HOST}:${BACKEND_PORT}"
  (
    cd "$REPO_ROOT"
    export CORS_ORIGINS="http://localhost:${FRONTEND_PORT},http://127.0.0.1:${FRONTEND_PORT}"
    exec "$VENV_DIR/bin/python" -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port "$BACKEND_PORT"
  ) &
  BACKEND_PID=$!

  wait_for_backend || fail "后端启动失败，请检查终端输出。"
  bootstrap_demo_data

  log "启动前端: http://${FRONTEND_HOST}:${FRONTEND_PORT}"
  (
    cd "$FRONTEND_DIR"
    export VITE_API_BASE_URL="http://127.0.0.1:${BACKEND_PORT}"
    exec npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" --strictPort
  ) &
  FRONTEND_PID=$!

  cat <<EOF
[cuteFC-gui] 启动完成
[cuteFC-gui] 前端地址: http://${FRONTEND_HOST}:${FRONTEND_PORT}
[cuteFC-gui] 后端地址: http://${BACKEND_HOST}:${BACKEND_PORT}
[cuteFC-gui] 停止服务: 在当前终端按 Ctrl+C
EOF

  wait "$BACKEND_PID" "$FRONTEND_PID"
}

main "$@"
