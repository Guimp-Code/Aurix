# Prompt Mestre para Melhorar o Framework Aurix 2.0

**Contexto Geral:**\
Você é um mestre arquiteto de software com mais de 20 anos de experiência em desenvolvimento de frameworks escaláveis, type-safe e assistidos por IA. Seu objetivo é refinar e expandir o framework Aurix para a versão 2.0, combinando o melhor do Aurix original (um sistema híbrido de desenvolvimento com múltiplos agentes de IA especializados, servidores MCP para comunicação, suporte offline e templates pré-definidos) com as melhores práticas do Igniter.js (um framework HTTP moderno em TypeScript, com tipagem de ponta a ponta, CLI interativa, plugins extensíveis, queues, real-time, caching e telemetria). O resultado deve ser um framework universal, produtivo, inteligente (híbrido com Cursor AI para orquestração principal e Ollama NITRO para reforço offline), otimizado para memória, extensível, seguro (com compliance enterprise e separação de documentação), e com foco especializado em UI/UX profissional (usando Atomic Design, WCAG 2.1 AA e responsividade).

O Aurix 2.0 deve ser construído inteiramente em TypeScript para garantir type-safety end-to-end, sem necessidade de geração de código adicional. Ele deve suportar qualquer tecnologia (web, mobile, back-end), automações LLM avançadas, e ser otimizado para desenvolvedores humanos e agentes de código (IA). Inclua todas as melhorias sugeridas: regras de treinamento em uma pasta .cursor/rules/ com arquivos .mdc específicos; um sistema de agentes baseado em MCP Server com arquivos como executor.ts, providers.ts e types.ts; um sistema de memória com fs.ts, manager.ts e types.ts para persistência offline; e ferramentas de delegação com agent-delegation.ts e task-management.ts.

**Instruções Principais para Refinamento:**

1. **Analise e Integre Fontes de Inspiração:**

   - Baseie-se no repositório original do Aurix: https://github.com/Guimp-Code/Aurix. Use o README para preservar a arquitetura com agentes especializados (Architect para análise e planejamento; Dev Builder para implementação de código; Dev.UI Engineer para frontend e UI/UX; LLM Architect para design de automações IA; QA Tester para validação e testes; Packager para build e distribuição; Manager para orquestração e compliance). Mantenha os MCP Servers (HTTP, SQLite, Git, fs-aurix, fs-context) para comunicação entre agentes, e as vantagens como universalidade, produtividade automatizada, IA híbrida, otimização de memória, suporte offline, extensibilidade e padrões enterprise.
   - Incorpore o melhor do Igniter.js: https://github.com/felipebarcelospro/igniter-js. Adote a type-safety end-to-end (definir APIs uma vez e obter clientes tipados em frontend sem sincronização manual), CLI interativa para scaffolding e desenvolvimento (ex.: npx @igniter-js/cli init/dev), sistema de plugins, features integradas como queues para tarefas assíncronas, real-time para atualizações, caching para performance, e telemetria para observabilidade. Use exemplos como controllers (users.controller.ts) para inspirar a implementação de agentes como procedures type-safe, e integração com React/Next.js para exemplos de uso.
   - Para implementação de agentes de IA em TypeScript, inspire-se em repositórios como:
     - https://github.com/VoltAgent/voltagent (orquestração de agentes com workflows dinâmicos).
     - https://github.com/openai/openai-agents-js (framework leve para multi-agentes com tracing e debugging).
     - https://github.com/axar-ai/axar (agentes prontos para produção com escalabilidade).
     - https://github.com/wrtnlabs/agentica (function calling e tool-use em agentes).
     - https://github.com/mastra-ai/mastra (framework para agents e assistants com integração LLM).
   - Para gerenciamento de memória, use ideias de: https://github.com/pverscha/SharedCore (estruturas thread-safe com SharedArrayBuffer para memória compartilhada) e https://github.com/dzharii/awesome-typescript (recursos para otimização em TS).
   - Para delegação de agentes e gerenciamento de tarefas: https://github.com/code/app-nous (plataforma de agentes autônomos); https://github.com/callstackincubator/fabrice-ai (delegação com estados filhos); https://github.com/awslabs/agent-squad (squads de agentes em TS); https://github.com/zcaceres/easy-agent (tool-use e prompt-caching); https://github.com/meissam/task-manager-with-react-and-typescript (gerenciamento básico de tarefas em TS).

2. **Implemente as Melhorias Específicas:**

   - **Regras de Treinamento (.cursor/rules/):** Crie uma pasta com arquivos .mdc (Markdown com metadados para o Cursor AI processar). Inclua:

     - frontend.mdc: Padrões para desenvolvimento frontend com Atomic Design, responsividade e integração com frameworks como React.
     - ux.mdc: Padrões de UX/UI com WCAG 2.1 AA, acessibilidade e design systems.
     - igniter-advanced-features.mdc: Funcionalidades avançadas como queues, caching, real-time e telemetria do Igniter.js.
     - igniter-client-usage.mdc: Uso de clientes type-safe para integrações frontend.
     - igniter-controllers.mdc: Padrões de controllers para ações de agentes.
     - igniter-procedures.mdc: Middleware e procedures para fluxos seguros.
     - middleware.mdc: Padrões de middleware para logging, autenticação e erro handling.\
       No código, crie uma função `applyRule(ruleName: string, config: any): Promise<any>` que aplique essas regras aos agentes, validando conformidade automaticamente.

   - **Sistema de Agentes (MCP Server):** Em /src/agents, inclua:

     - executor.ts: Função assíncrona para executar tarefas de agentes com error handling, tracing e integração com Cursor AI/Ollama (ex.: `async function executeTask(agentName: string, task: Task): Promise<Result> { ... }`).
     - providers.ts: Provisionamento dinâmico de agentes, com suporte híbrido (online/offline).
     - types.ts: Interfaces como `interface Agent { name: string; execute: (task: Task) => Promise<Result>; }`. Integre com MCP Servers para comunicação (HTTP para online, fs/SQLite para offline persistência).

   - **Sistema de Memória:** Em /src/memory, inclua:

     - fs.ts: Persistência em arquivo para suporte offline, usando Node.js fs com JSON serialization e thread-safety (ex.: `async function saveState(state: MemoryState): Promise<void> { ... }`).
     - manager.ts: Gerenciamento de cache, ajuste automático de memória (limites baseados em RAM disponível) e limpeza.
     - types.ts: Tipos como `interface MemoryState { projectId: string; data: any; timestamp: Date; }`.

   - **Ferramentas de Delegação:** Em /src/delegation, inclua:

     - agent-delegation.ts: Delegação entre agentes com prioridades e filas (ex.: `async function delegateTask(fromAgent: string, toAgent: string, config: DelegationConfig): Promise<Result> { ... }`).
     - task-management.ts: Gerenciamento de tarefas com estados (pending, running, completed), tracking via telemetria e cancelamento.

3. **Estrutura Geral do Repositório:**

   - Crie uma estrutura modular: /src (com subpastas agents, memory, delegation); /.cursor/rules (arquivos .mdc); /examples (projetos didáticos); /tests (testes unitários com Jest); /docs (documentos como setup.md, agents.md); package.json (dependências como zod, typescript, jest); tsconfig.json; .gitignore (excluindo node_modules, .env, dist, etc.).

4. **Recursos Adicionais:**

   - **CLI:** Implemente uma CLI como `npx @aurix/cli init my-app` para gerar projetos e `npx @aurix/cli dev` para dashboard interativo.
   - **Exemplos:** Em /examples, crie simple_ui_project.ts: Um exemplo que usa Dev.UI Engineer com delegação, regras (frontend.mdc, ux.mdc) e saveState.
   - **Testes:** Cobertura completa em /tests, como testes para delegateTask e executeTask.
   - **Documentação:** Atualize o README.md com quick start, features, diagrama de arquitetura, exemplos inline e licença MIT.
   - **Segurança:** Adicione safety policies em LLM Architect (validação de inputs, sandboxing), middleware para autenticação e compliance (separação docs_aurix vs projeto).

**Objetivo Final:**\
Gere o código completo, atualize o repositório e forneça sugestões para testes e deploy. Certifique-se de que o Aurix 2.0 seja didático para cursor, com exemplos claros e estrutura extensível para novos agentes ou MCPs. Foque em performance, escalabilidade e DX superior.