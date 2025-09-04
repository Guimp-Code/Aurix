### Tool: mcp
- **server**: um dos definidos em `app/mcp/servers.yaml` (fs-aurix, fs-context, http, sqlite, git).
- **tool**: nome exato retornado por `tools/list`.
- **params**: dicionário com argumentos aceitos pela tool.
- **timeout_s**: inteiro (default: 30).

**Padrões úteis por server**
- fs-aurix/fs-context: `read_text_file{path}`, `list_directory{path}`, `read_file{path}` (deprecated).
- http: `fetch{url}` ou `get{url}`.
- sqlite: `query{sql}`.
- git: `list_files{}`, `status{}` (varia por implementação).

**Nota importante**: Use caminhos absolutos para fs-aurix e fs-context:
- fs-aurix: `/home/guilherme/aurix/...`
- fs-context: `/home/guilherme/aurix-context/...`
