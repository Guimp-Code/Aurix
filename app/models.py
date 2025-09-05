# ==== Ação MCP (modelos) ====
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class MCPArgs(BaseModel):
    server: str = Field(..., description="Nome do servidor MCP conforme servers.yaml (ex.: fs-context)")
    tool: str = Field(..., description="Nome da ferramenta exposta pelo servidor MCP (ex.: readFile)")
    params: Dict[str, Any] = Field(default_factory=dict, description="Parâmetros da tool")
    timeout_s: int = Field(30, ge=1, le=120, description="Timeout em segundos")

# Se você tem um enum de ações, inclua "mcp".
# Exemplo genérico (ajuste ao seu enum/validador):
try:
    from enum import Enum
    class ActionName(Enum):
        search = "search"
        browser = "browser"
        shell = "shell"
        write = "write"
        terminal = "terminal"
        mcp = "mcp"
        final = "final"
except Exception:
    pass
