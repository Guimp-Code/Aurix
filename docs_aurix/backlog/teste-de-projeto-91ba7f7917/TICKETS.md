# Backlog — LLM Automation

## LLM-0001 — Define framework e skeleton

Selecionar e fixar framework 'langchain'. Criar skeleton com pastas, env, providers e adapters.
- owner: llmArchitect

## LLM-0002 — Modelar agentes

Projetar papéis e contratos para: orchestrator. Definir entradas/saídas, limites de iteração e métricas.
- owner: llmDevExecutor

## LLM-0003 — Conectar datasources

Configurar fontes: [] com validadores e limites.
- owner: llmDevExecutor

## LLM-0004 — Observabilidade

Implementar logs JSON, IDs de correlação e contadores de falha/latência.
- owner: llmDevExecutor

## LLM-0005 — Segurança e prontidão

Timeouts, retries/backoff, circuit breaker (se aplicável), rollback de artefatos.
- owner: llmDevExecutor

## LLM-0006 — Testes

Unit/integration para pipelines críticos + smoke E2E.
- owner: llmDevExecutor

## LLM-0007 — Documentação

Especificar prompts, limites, fallback, e rotas de rollback. Atualizar README/CHANGELOG.
- owner: llmDevExecutor

## LLM-0008 — Estrutura de documentação do projeto

Criar pasta teste-projeto/docs com subpastas: prompts/, specs/, api/, deployment/. Organizar documentação específica do projeto separada do framework.
- owner: llmArchitect
