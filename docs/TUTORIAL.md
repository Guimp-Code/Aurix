# 🚀 Tutorial Completo - Aurix Framework 2.0

## 📋 **Índice**
1. [Instalação](#instalação)
2. [Primeiro Projeto](#primeiro-projeto)
3. [Agentes Especializados](#agentes-especializados)
4. [Sistema de Memória](#sistema-de-memória)
5. [Delegação de Tarefas](#delegação-de-tarefas)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Configuração Avançada](#configuração-avançada)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 **Instalação**

### **Pré-requisitos:**
- Node.js 18+ 
- npm ou yarn
- Git

### **1. Clone o repositório:**
```bash
git clone https://github.com/Guimp-Code/Aurix.git
cd Aurix
```

### **2. Instale as dependências:**
```bash
npm install
```

### **3. Compile o framework:**
```bash
npm run build
```

### **4. Execute os testes:**
```bash
npm test -- --forceExit
```

### **5. Teste o exemplo:**
```bash
npx ts-node examples/simple_ui_project.ts
```

---

## 🎯 **Primeiro Projeto**

### **1. Inicialize o framework:**
```typescript
import { AurixFramework } from './src/index';

const aurix = new AurixFramework({
  memoryConfig: {
    maxCacheSize: 100,
    persistToDisk: true,
    autoCleanup: true
  }
});
```

### **2. Execute seu primeiro agente:**
```typescript
const result = await aurix.executeTask('architect', {
  type: 'analyze_requirements',
  config: {
    requirements: 'Criar uma landing page responsiva',
    technology: ['React', 'TypeScript', 'Tailwind CSS']
  }
});

console.log('Análise do Architect:', result.data);
```

### **3. Delegue para outro agente:**
```typescript
const uiResult = await aurix.delegateTask(
  'architect',     // agente origem
  'dev_ui',        // agente destino
  {
    type: 'generate_ui',
    config: {
      template: 'atomic_design',
      framework: 'react',
      accessibility: true
    }
  }
);

console.log('UI Gerada:', uiResult.data);
```

---

## 🤖 **Agentes Especializados**

### **🏛️ Architect Agent**
```typescript
// Análise de requisitos
const analysis = await aurix.executeTask('architect', {
  type: 'analyze_requirements',
  config: {
    requirements: 'Sistema de e-commerce completo',
    constraints: ['Mobile-first', 'Acessibilidade WCAG 2.1'],
    timeline: '3 meses'
  }
});

// Design de arquitetura
const architecture = await aurix.executeTask('architect', {
  type: 'design_architecture',
  config: {
    requirements: analysis.data,
    scalability: 'microservices',
    database: 'postgresql'
  }
});

// Criação de plano
const plan = await aurix.executeTask('architect', {
  type: 'create_plan',
  config: {
    architecture: architecture.data,
    phases: ['MVP', 'Scaling', 'Advanced Features']
  }
});
```

### **⚒️ Dev Builder Agent**
```typescript
// Implementação de feature
const implementation = await aurix.executeTask('dev_builder', {
  type: 'implement_feature',
  config: {
    specification: 'Sistema de autenticação JWT',
    files: ['auth.service.ts', 'auth.controller.ts', 'auth.middleware.ts'],
    tests: true,
    documentation: true
  }
});

// Refatoração de código
const refactoring = await aurix.executeTask('dev_builder', {
  type: 'refactor_code',
  config: {
    target: 'user.service.ts',
    improvements: ['performance', 'readability', 'type_safety'],
    preserveAPI: true
  }
});

// Otimização de performance
const optimization = await aurix.executeTask('dev_builder', {
  type: 'optimize_performance',
  config: {
    target: 'api_endpoints',
    metrics: ['response_time', 'memory_usage', 'cpu_usage'],
    threshold: '< 200ms'
  }
});
```

### **🎨 Dev.UI Engineer Agent**
```typescript
// Geração de componentes
const components = await aurix.executeTask('dev_ui', {
  type: 'generate_ui',
  config: {
    template: 'atomic_design',
    framework: 'react',
    styling: 'tailwind',
    accessibility: true,
    responsive: true
  }
});

// Validação de acessibilidade
const accessibility = await aurix.executeTask('dev_ui', {
  type: 'validate_accessibility',
  config: {
    components: ['Button', 'Form', 'Navigation'],
    standard: 'WCAG_2_1_AA',
    tools: ['axe-core', 'lighthouse']
  }
});

// Otimização responsiva
const responsive = await aurix.executeTask('dev_ui', {
  type: 'optimize_responsive',
  config: {
    breakpoints: ['mobile', 'tablet', 'desktop'],
    approach: 'mobile_first',
    performance: 'core_web_vitals'
  }
});
```

### **🧠 LLM Architect Agent**
```typescript
// Design de automação
const automation = await aurix.executeTask('llm_architect', {
  type: 'design_automation',
  config: {
    workflow: 'customer_support_chatbot',
    llm_provider: 'openai',
    safety_level: 'enterprise',
    context_window: 4096
  }
});

// Otimização de prompts
const prompts = await aurix.executeTask('llm_architect', {
  type: 'optimize_prompts',
  config: {
    domain: 'e_commerce',
    tasks: ['product_description', 'customer_support', 'content_generation'],
    model: 'gpt-4'
  }
});

// Políticas de segurança
const safety = await aurix.executeTask('llm_architect', {
  type: 'implement_safety',
  config: {
    policies: ['input_validation', 'output_filtering', 'rate_limiting'],
    compliance: ['gdpr', 'lgpd'],
    monitoring: true
  }
});
```

---

## 🧠 **Sistema de Memória**

### **💾 Memória de Projeto:**
```typescript
// Salvar dados do projeto
await aurix.memory.setProjectMemory('meu_ecommerce', {
  architecture: 'microservices',
  components: ['auth', 'catalog', 'cart', 'payment'],
  status: 'development',
  timeline: {
    start: new Date(),
    milestones: [
      { name: 'MVP', date: '2024-04-01' },
      { name: 'Beta', date: '2024-05-01' },
      { name: 'Launch', date: '2024-06-01' }
    ]
  }
});

// Recuperar dados do projeto
const projectData = await aurix.memory.getProjectMemory('meu_ecommerce');
console.log('Status do projeto:', projectData.status);
```

### **🤖 Memória de Agente:**
```typescript
// Salvar preferências do agente
await aurix.memory.setAgentMemory('dev_ui', {
  preferences: {
    framework: 'react',
    styling: 'tailwind',
    theme: 'dark_mode',
    verbosity: 'detailed'
  },
  executionHistory: [
    { task: 'generate_button', time: 1200, success: true },
    { task: 'create_form', time: 2800, success: true }
  ],
  learnings: [
    {
      pattern: 'accessibility_first',
      solution: 'Always include aria-labels and focus management',
      confidence: 95
    }
  ]
}, 'meu_ecommerce');

// Recuperar preferências
const agentData = await aurix.memory.getAgentMemory('dev_ui', 'meu_ecommerce');
```

### **👤 Memória de Usuário:**
```typescript
// Salvar dados do usuário
await aurix.memory.setUserMemory('guilherme', {
  preferences: {
    language: 'pt-BR',
    theme: 'dark',
    notifications: true
  },
  projects: ['ecommerce', 'portfolio', 'saas'],
  analytics: {
    totalSessions: 127,
    totalActions: 1843,
    favoriteAgents: ['dev_ui', 'architect'],
    avgSessionTime: 45 // minutos
  }
});
```

### **🔍 Consultas Avançadas:**
```typescript
// Buscar por projeto específico
const projectStates = await aurix.memory.queryStates({
  projectId: 'meu_ecommerce',
  limit: 10
});

// Buscar por usuário
const userStates = await aurix.memory.queryStates({
  userId: 'guilherme',
  fromDate: new Date('2024-01-01'),
  tags: ['frontend', 'ui']
});

// Buscar por período
const recentStates = await aurix.memory.queryStates({
  fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // últimos 7 dias
  limit: 50
});
```

---

## 🔄 **Delegação de Tarefas**

### **🎯 Delegação Simples:**
```typescript
// Delegar tarefa específica
const result = await aurix.delegateTask(
  'architect',      // de
  'dev_builder',    // para
  {
    type: 'implement_feature',
    config: {
      specification: 'Sistema de pagamento com Stripe',
      security: 'PCI_DSS',
      tests: true
    }
  }
);
```

### **⛓️ Cadeia de Delegação (Pipeline):**
```typescript
const chainResult = await aurix.delegator.delegateChain([
  {
    agent: 'architect',
    task: {
      type: 'design_architecture',
      config: { requirements: 'API de produtos' }
    }
  },
  {
    agent: 'dev_builder',
    task: {
      type: 'implement_feature',
      config: { feature: 'product_crud_api' }
    }
  },
  {
    agent: 'qa_tester',
    task: {
      type: 'validate_quality',
      config: { coverage: 90, performance: true }
    }
  }
]);

console.log('Pipeline executado:', chainResult.map(r => r.success));
```

### **📝 Gerenciamento de Tarefas:**
```typescript
// Adicionar tarefa com prioridade
const taskId = aurix.addTask(
  {
    type: 'optimize_performance',
    config: { target: 'database_queries' }
  },
  'dev_builder',
  'urgent'  // prioridade
);

// Adicionar tarefa com dependências
const dependentTaskId = aurix.addTask(
  {
    type: 'deploy_to_production',
    config: { environment: 'aws' }
  },
  'manager',
  'high',
  [taskId]  // depende da otimização
);

// Verificar status
const task = aurix.taskManager.getTask(taskId);
console.log('Status da tarefa:', task?.status);
```

---

## 🎯 **Exemplos Práticos**

### **Exemplo 1: E-commerce Completo**
```typescript
import { AurixFramework } from '@aurix/framework';

async function criarEcommerce() {
  const aurix = new AurixFramework();

  // 1. Planejamento
  const plan = await aurix.executeTask('architect', {
    type: 'analyze_requirements',
    config: {
      requirements: 'Loja virtual com carrinho, pagamento e admin',
      technology: ['React', 'Node.js', 'PostgreSQL'],
      integrations: ['Stripe', 'Mercado Pago']
    }
  });

  // 2. Backend
  const backend = await aurix.executeTask('dev_builder', {
    type: 'implement_feature',
    config: {
      specification: 'API REST com autenticação JWT',
      endpoints: ['auth', 'products', 'orders', 'payments'],
      database: 'postgresql'
    }
  });

  // 3. Frontend
  const frontend = await aurix.executeTask('dev_ui', {
    type: 'generate_ui',
    config: {
      template: 'ecommerce',
      framework: 'react',
      pages: ['home', 'catalog', 'cart', 'checkout'],
      responsive: true,
      accessibility: true
    }
  });

  // 4. Testes
  const tests = await aurix.executeTask('qa_tester', {
    type: 'validate_quality',
    config: {
      backend: backend.data,
      frontend: frontend.data,
      coverage: 85,
      performance: true
    }
  });

  console.log('E-commerce criado com sucesso!');
  return { plan, backend, frontend, tests };
}
```

### **Exemplo 2: Dashboard Administrativo**
```typescript
async function criarDashboard() {
  const aurix = new AurixFramework();

  // Pipeline completo
  const results = await aurix.delegator.delegateChain([
    {
      agent: 'architect',
      task: {
        type: 'design_architecture',
        config: { type: 'admin_dashboard' }
      }
    },
    {
      agent: 'dev_ui',
      task: {
        type: 'generate_ui',
        config: {
          template: 'dashboard',
          components: ['sidebar', 'charts', 'tables', 'forms']
        }
      }
    },
    {
      agent: 'dev_builder',
      task: {
        type: 'implement_feature',
        config: { feature: 'data_visualization' }
      }
    }
  ]);

  return results;
}
```

### **Exemplo 3: Automação LLM**
```typescript
async function criarChatbot() {
  const aurix = new AurixFramework();

  // Design da automação
  const automation = await aurix.executeTask('llm_architect', {
    type: 'design_automation',
    config: {
      workflow: 'customer_support_chatbot',
      knowledge_base: 'product_documentation',
      languages: ['pt-BR', 'en-US'],
      safety_filters: true
    }
  });

  // Implementação
  const implementation = await aurix.executeTask('dev_builder', {
    type: 'implement_feature',
    config: {
      specification: automation.data,
      framework: 'langchain',
      vector_db: 'pinecone',
      llm_provider: 'openai'
    }
  });

  return { automation, implementation };
}
```

---

## ⚙️ **Configuração Avançada**

### **Configuração de Memória:**
```typescript
const aurix = new AurixFramework({
  memoryConfig: {
    maxCacheSize: 200,           // máximo de entradas em cache
    persistToDisk: true,         // salvar em arquivo
    autoCleanup: true,           // limpeza automática
    cleanupInterval: 1800000,    // 30 minutos
    compressionEnabled: true     // compressão de dados
  },
  storagePath: './custom_memory' // pasta personalizada
});
```

### **Configuração do Task Manager:**
```typescript
const aurix = new AurixFramework({
  taskManagerConfig: {
    maxConcurrentTasks: 10,      // máximo de tarefas simultâneas
    defaultTimeout: 60000,       // timeout padrão (60s)
    retryAttempts: 5,            // tentativas de retry
    enablePriorityQueue: true,   // fila por prioridade
    enableDependencyResolution: true // resolução de dependências
  }
});
```

### **Configuração de Agentes:**
```typescript
// Configurar agente específico
aurix.provider.configureAgent('dev_ui', {
  name: 'dev_ui',
  type: 'dev_ui',
  enabled: true,
  settings: {
    defaultFramework: 'react',
    defaultStyling: 'tailwind',
    accessibilityFirst: true,
    mobileFirst: true
  }
});
```

---

## 📊 **Monitoramento e Estatísticas**

### **Estatísticas do Framework:**
```typescript
const stats = aurix.getStats();

console.log('📈 Estatísticas de Execução:', {
  totalExecutions: stats.executor.totalExecutions,
  successRate: `${stats.executor.successRate.toFixed(1)}%`,
  averageTime: `${stats.executor.averageExecutionTime.toFixed(0)}ms`,
  agentUsage: stats.executor.agentUsage
});

console.log('🧠 Estatísticas de Memória:', {
  cacheSize: stats.memory.cacheSize,
  hitRate: `${stats.memory.hitRate.toFixed(1)}%`,
  totalEntries: stats.memory.totalEntries
});

console.log('🔄 Estatísticas de Delegação:', {
  totalDelegations: stats.delegation.totalDelegations,
  successRate: `${stats.delegation.successRate.toFixed(1)}%`,
  averageTime: `${stats.delegation.averageTime.toFixed(0)}ms`
});
```

### **Histórico de Execução:**
```typescript
// Ver últimas execuções
const history = aurix.executor.getExecutionHistory(10);
history.forEach(h => {
  console.log(`${h.result.metadata?.agent}: ${h.task.type} - ${h.result.success ? '✅' : '❌'}`);
});

// Ver delegações recentes
const delegations = aurix.delegator.getRecentDelegations(5);
delegations.forEach(d => {
  console.log(`${d.delegation.fromAgent} → ${d.delegation.toAgent}: ${d.success ? '✅' : '❌'}`);
});
```

---

## 🔧 **Troubleshooting**

### **Problema: Agente não encontrado**
```typescript
// Verificar agentes disponíveis
const availableAgents = aurix.executor.listAvailableAgents();
console.log('Agentes disponíveis:', availableAgents);

// Verificar se agente específico está disponível
const isAvailable = aurix.executor.isAgentAvailable('dev_ui');
console.log('Dev.UI disponível:', isAvailable);
```

### **Problema: Tarefa travada**
```typescript
// Cancelar tarefa
const cancelled = aurix.taskManager.cancelTask(taskId);

// Ver tarefas em execução
const runningTasks = aurix.taskManager.getTasks('running');
console.log('Tarefas em execução:', runningTasks.length);
```

### **Problema: Memória cheia**
```typescript
// Otimizar memória
const optimization = await aurix.memory.optimizeMemory();
console.log(`Otimização: ${optimization.saved} entradas removidas`);

// Limpeza forçada
const cleaned = await aurix.memory.forceCleanup(7); // últimos 7 dias
console.log(`Limpeza: ${cleaned} entradas antigas removidas`);

// Limpar cache
aurix.memory.clearCache();
```

### **Problema: Performance lenta**
```typescript
// Verificar estatísticas
const stats = aurix.getStats();
if (stats.executor.averageExecutionTime > 5000) {
  console.log('⚠️ Performance degradada - considere otimizar agentes');
}

// Reduzir concorrência
aurix.taskManager = new TaskManager({
  maxConcurrentTasks: 3  // reduzir de 5 para 3
});
```

---

## 🚀 **Comandos Úteis**

### **Desenvolvimento:**
```bash
# Modo desenvolvimento com watch
npm run dev

# Compilar para produção
npm run build

# Executar testes
npm test

# Testes com cobertura
npm test -- --coverage

# Exemplo específico
npx ts-node examples/simple_ui_project.ts
```

### **Debugging:**
```bash
# Testes com detalhes
npm test -- --verbose

# Detectar handles abertos
npm test -- --detectOpenHandles

# Executar teste específico
npm test -- executor.test.ts

# Forçar saída dos testes
npm test -- --forceExit
```

---

## 📚 **Próximos Passos**

### **1. Personalização:**
- Crie seus próprios agentes especializados
- Configure regras de treinamento personalizadas
- Implemente MCP servers customizados

### **2. Integração:**
- Integre com seu IDE favorito
- Configure CI/CD para automação
- Implemente métricas personalizadas

### **3. Expansão:**
- Adicione novos tipos de tarefa
- Implemente novos frameworks
- Crie templates de projeto

---

## 🎯 **Conclusão**

O **Aurix Framework 2.0** é uma ferramenta poderosa para automação de desenvolvimento com IA. Use este tutorial como base e explore as possibilidades infinitas!

**Para dúvidas ou suporte:**
- 📖 Documentação: `./docs/`
- 🐛 Issues: GitHub Issues
- 💬 Discussões: GitHub Discussions

**Bom desenvolvimento com Aurix 2.0!** 🚀✨
