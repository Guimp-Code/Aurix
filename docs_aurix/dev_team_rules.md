# Regras de Engenharia — Aurix

## Segurança & Escopo
- Não usar servidor web, Electron, Tauri, WebView. App é nativo (PySide6).
- Escritas SEMPRE dentro de `~/aurix`.
- **Somente o Architect** pode usar rede (MCP "http"). Demais agentes: offline local.

## Idempotência & Escrita Atômica
- Antes de gravar, compare conteúdo; se igual, não reescreva.
- Escreva em arquivo temporário e finalize com `os.replace` (atomic write).
- Lock por arquivo `.lock` quando editar.

## Anti-loop & Execução
- Cada agente faz **uma passada** (no-retry interno). Repetições só por re-disparo externo.
- Limitar geração a **no máx. 10 arquivos** por execução.
- Não renomear / apagar arquivos fora do escopo do ticket.

## Tarefas
- Formato de task: `data/backlog/AURIX-XXXX.json` {id,title,desc,owner,acceptance[]}.
- O Architect nunca reescreve tasks com o mesmo ID; deve **atualizar** incrementalmente.

## Qualidade
- Builder: código Python 3.10+, docstrings, comentários essenciais.
- QA: `py_compile` em todos .py, import smoke de módulos críticos, saída clara.
- Packager: não falhar silenciosamente; retornar logs em caso de erro.

## Manager — políticas
- Entrada: {"add_docs":[{name,content}], "add_urls":[...], "start":bool, "scrape":bool}.
- Escrita atômica e idempotente em `docs_aurix/`; deduplicação de URLs em `docs_aurix/research_urls.txt`.
- Nunca acessar rede; apenas chama Architect com {"scrape": true|false}.
- Uma passada; sem loops internos. Em caso de erro, retornar JSON com "ok": false e mensagem objetiva.

## Projetos — Estrutura de Documentação
- **docs_aurix/** (raiz): Documentação do framework, padrões e regras do time de desenvolvimento
- **projeto/docs/**: Cada projeto deve ter sua própria pasta `docs/` para documentação específica
- **Separação de responsabilidades**:
  - `docs_aurix/` (raiz): Padrões, prompts e regras do framework Aurix
- `projeto/docs/`: Documentação específica do projeto (prompts, especificações, etc.)
- **Arquitetura de projetos**: O LLM Architect deve criar `projeto/docs/` automaticamente
- **Manager**: Responsável por organizar documentação específica do projeto em `projeto/docs/`
