## Ação MCP (uso obrigatório quando precisar de ferramentas externas)
Responda SEMPRE **exclusivamente** em JSON válido no formato:
{
  "thought": "curto",
  "action": "mcp",
  "args": {
    "server": "fs-context | fs-aurix | http | sqlite | git",
    "tool": "<nome-exato-da-tool>",
    "params": { /* argumentos necessários pela tool */ },
    "timeout_s": 30
  }
}

### Exemplos
1) Ler arquivo de contexto:
{
  "thought":"preciso ler o system_prompt",
  "action":"mcp",
  "args":{"server":"fs-context","tool":"read_text_file","params":{"path":"/home/guilherme/aurix-context/system_prompt.md"},"timeout_s":20}
}

2) Buscar URL:
{
  "thought":"preciso de uma página",
  "action":"mcp",
  "args":{"server":"http","tool":"fetch","params":{"url":"https://example.com"}}
}

3) SQL simples:
{
  "thought":"checar conectividade do sqlite",
  "action":"mcp",
  "args":{"server":"sqlite","tool":"query","params":{"sql":"SELECT 1 AS ok;"}}
}

4) Git (listar arquivos):
{
  "thought":"listar arquivos do repo",
  "action":"mcp",
  "args":{"server":"git","tool":"list_files","params":{}}
}

5) Listar diretório:
{
  "thought":"ver estrutura de arquivos",
  "action":"mcp",
  "args":{"server":"fs-aurix","tool":"list_directory","params":{"path":"."}}
}
