# Controller principal do Aurix

# --- MCP hook (stub) ---
try:
    from app.mcp import get_mcp_client
    def mcp_action(server: str, tool: str, params: dict, timeout_s: int = 30) -> dict:
        client = get_mcp_client()
        return client.call(server, tool, params, timeout_s)
except Exception as _e:
    # Controller pode carregar antes da infra MCP estar pronta
    def mcp_action(server: str, tool: str, params: dict, timeout_s: int = 30) -> dict:
        return {"ok": False, "error": f"MCP indisponível: {_e}"}

# ==== Integração da ação MCP no loop do orquestrador ====
import json, time
from typing import Dict, Any

try:
    from app.mcp import get_mcp_client
except Exception:
    get_mcp_client = None

def _handle_mcp_action(plan: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executa uma ação MCP a partir de um 'plan' com:
      plan = {"action":"mcp","args":{"server": "...", "tool": "...", "params": {...}, "timeout_s": 30}}
    Retorna um dict com {"ok": bool, "data"?: any, "error"?: str}
    """
    if get_mcp_client is None:
        return {"ok": False, "error": "Infra MCP indisponível (get_mcp_client=None)"}
    args = plan.get("args", {}) or {}
    server = args.get("server")
    tool   = args.get("tool")
    params = args.get("params", {})
    timeout_s = int(args.get("timeout_s", 30))
    if not server or not tool:
        return {"ok": False, "error": "args incompletos para mcp: 'server' e 'tool' são obrigatórios"}
    client = get_mcp_client()
    t0 = time.time()
    res = client.call(server, tool, params, timeout_s=timeout_s)
    res["_latency_ms"] = int((time.time() - t0)*1000)
    return res

# >>> Em seu loop principal de execução (onde você já trata 'search','browser','shell','write','terminal','final'):
# adicione o caso abaixo dentro do dispatcher:
#
#    elif action == "mcp":
#        res = _handle_mcp_action(plan)
#        logs.append(f"[MCP] {args.get('server')}::{args.get('tool')} -> {'ok' if res.get('ok') else res.get('error')}")
#        memory.append({"user":"(mcp result)","assistant":res})
#        continue
#
# (Ajuste nomes de variáveis: plan, action, args, logs, memory conforme seu controller.)

# ==== Hook de agentes (dispatcher) ====
from typing import Dict, Any
def agent_action(name: str, task: Dict[str, Any]) -> Dict[str, Any]:
    try:
        from app.agents import dispatch_agent
        return dispatch_agent(name, task)
    except Exception as e:
        return {"ok": False, "error": f"agentes indisponíveis: {e}"}

# Instrução para o loop do planner (exemplo):
# elif action == "agent":
#     res = agent_action(args.get("name"), args.get("task", {}))
#     logs.append(f"[agent] {args.get('name')} -> {'ok' if res.get('ok') else res.get('error')}")
#     continue
