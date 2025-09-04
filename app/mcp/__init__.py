from pathlib import Path
from typing import Optional
from app.tools.mcp_tool import MCPClient

_singleton = None

def get_mcp_client(servers_yaml: Optional[Path] = None) -> MCPClient:
    global _singleton
    if _singleton is None:
        default = servers_yaml or Path.home() / "aurix" / "app" / "mcp" / "servers.yaml"
        _singleton = MCPClient(default)
    return _singleton
