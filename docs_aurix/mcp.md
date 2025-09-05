# MCP (Model Context Protocol) – Aurix

- Configuração: `app/mcp/servers.yaml`
- Cliente: `app/tools/mcp_tool.py` (STDIO, JSON-RPC, timeouts, reconexão)
- Singleton: `app/mcp/__init__.py`
- Teste: `python -m app.tests.check_mcp`

## Ajustes rápidos
- Edite paths no `servers.yaml` (suporta ~, $HOME, $USER; são expandidos no cliente).
- Se `uvx` não existir, o cliente troca git server para `mcp-server-git`.

## Erros comuns
- npx ausente → instale Node/npm.
- uvx ausente → use pipx para `mcp-server-git` ou instale uv.
- ferramenta não encontrada → rode check_mcp para ver nomes reais de tools.

## Integração da ação "mcp" no orquestrador
- O controller despacha `action=="mcp"` para `app.mcp.get_mcp_client().call(...)`.
- Contexto do planner atualizado para sugerir o formato correto.
- Testes:
  ```bash
  # Lista tools e faz uma chamada de cada (já existe):
  python -m app.tests.check_mcp

  # Integração direta:
  python -m app.tests.run_mcp_action --server fs-context --tool readFile --params '{"path":"system_prompt.md"}'
  python -m app.tests.run_mcp_action --server http --tool fetch --params '{"url":"https://example.com"}'
  python -m app.tests.run_mcp_action --server sqlite --tool query --params '{"sql":"SELECT 1 AS ok;"}'
  ```
