#!/usr/bin/env bash
set -euo pipefail

AURIX_DIR="${HOME}/aurix"
CTX_DIR="${HOME}/aurix-context"
MCP_DIR="${AURIX_DIR}/app/mcp"
SQLITE_DB="${AURIX_DIR}/data/demo.sqlite"
SERVERS_YAML="${MCP_DIR}/servers.yaml"

cyan(){ echo -e "\033[36m$*\033[0m"; }
ok(){ echo -e "\033[32m[OK]\033[0m $*"; }
err(){ echo -e "\033[31m[ERRO]\033[0m $*" >&2; }

mkdir -p "${AURIX_DIR}/app" "${AURIX_DIR}/data/logs" "${AURIX_DIR}/data/artifacts" "${MCP_DIR}" "${CTX_DIR}"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  cyan "Instalando Node.js + npm..."
  sudo apt update && sudo apt install -y nodejs npm
fi
ok "Node/npm prontos."

if ! command -v uvx >/dev/null 2>&1 && ! command -v mcp-server-git >/dev/null 2>&1; then
  cyan "Instalando uv (uvx) ou pipx para mcp-server-git..."
  curl -LsSf https://astral.sh/uv/install.sh | sh || true
  export PATH="${HOME}/.local/bin:${PATH}"
  if ! command -v uvx >/dev/null 2>&1; then
    sudo apt install -y pipx || sudo apt install -y python3-pip || true
    python3 -m pip install --user pipx || true
    export PATH="${HOME}/.local/bin:${PATH}"
    pipx install mcp-server-git || python3 -m pip install --user mcp-server-git
  fi
fi
ok "Git MCP disponível (uvx ou mcp-server-git)."

# Criar DB sqlite de exemplo
mkdir -p "$(dirname "${SQLITE_DB}")"
: > "${SQLITE_DB}"
ok "SQLite DB: ${SQLITE_DB}"

# Garantir servers.yaml (não sobrescreve se já existir)
if [ ! -f "${SERVERS_YAML}" ]; then
  cat > "${SERVERS_YAML}" <<'YAML'
servers:
  fs-aurix:
    command: ["npx", "-y", "@modelcontextprotocol/server-filesystem", "$HOME/aurix"]
  fs-context:
    command: ["npx", "-y", "@modelcontextprotocol/server-filesystem", "$HOME/aurix-context"]
  http:
    command: ["npx", "-y", "@modelcontextprotocol/server-http"]
  sqlite:
    command: ["npx", "-y", "@modelcontextprotocol/server-sqlite", "$HOME/aurix/data/demo.sqlite"]
  git:
    command: ["uvx", "mcp-server-git", "--repository", "$HOME/aurix"]
YAML
  ok "servers.yaml criado."
else
  ok "servers.yaml já existe."
fi

# Smoke executáveis
timeout 15s npx -y @modelcontextprotocol/server-filesystem --help >/dev/null 2>&1 && ok "filesystem ok" || err "filesystem falhou"
timeout 15s npx -y @modelcontextprotocol/server-http --help >/dev/null 2>&1 && ok "http ok" || err "http falhou"
timeout 15s npx -y @modelcontextprotocol/server-sqlite --help >/dev/null 2>&1 && ok "sqlite ok" || err "sqlite falhou"
if command -v uvx >/dev/null 2>&1; then
  timeout 15s uvx mcp-server-git --help >/dev/null 2>&1 && ok "git ok" || err "git falhou"
else
  timeout 15s mcp-server-git --help >/dev/null 2>&1 && ok "git ok" || err "git falhou"
fi

echo
ok "MCPs prontos. Rode:  python -m app.tests.check_mcp"
