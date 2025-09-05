# Aurix 2.0

🚀 **Hybrid AI development framework combining agents, MCP servers, and type-safety.**

## 🎯 Quick Start

```bash
# Clone repository
git clone https://github.com/Guimp-Code/Aurix.git
cd Aurix

# Install dependencies
npm install

# Run example
npm run dev -- examples/simple_ui_project.ts

# Run tests
npm test

# Build framework
npm run build
```

## ✨ Key Features

- 🤖 **6 Specialized AI Agents**: Architect, Dev Builder, Dev.UI Engineer, LLM Architect, QA Tester, Manager
- 🧠 **Intelligent Memory System**: Persistent storage with cache optimization and auto-cleanup
- 🔄 **Advanced Task Delegation**: Priority queues, dependency resolution, and retry mechanisms
- 📝 **Cursor AI Rules**: Specialized training rules for consistent development patterns
- ⚡ **TypeScript Type-Safe**: End-to-end type safety without code generation
- 🌐 **Universal Framework**: Works with any technology (React, Vue, Node.js, Python, etc.)
- 💾 **Offline Support**: Full functionality without internet connection
- 🔧 **Extensible Architecture**: Easy to add new agents or customize existing ones

## 🏗️ Architecture

```
aurix-2.0/
├── .cursor/rules/           # AI training rules
├── src/
│   ├── agents/             # Agent system (executor, providers, types)
│   ├── memory/             # Memory management (fs, manager, types)
│   ├── delegation/         # Task delegation and management
│   └── index.ts            # Main framework entry
├── examples/               # Usage examples
├── tests/                  # Unit tests with Jest
└── docs/                   # Documentation
```

## 🤖 Agents Overview

### **🏛️ Architect Agent**
- **Purpose**: Requirements analysis and architecture design
- **Capabilities**: System design, technology selection, project planning
- **Usage**: `executeTask('architect', { type: 'analyze_requirements', config: {...} })`

### **⚒️ Dev Builder Agent**
- **Purpose**: Code implementation and feature development
- **Capabilities**: Code generation, refactoring, optimization
- **Usage**: `executeTask('dev_builder', { type: 'implement_feature', config: {...} })`

### **🎨 Dev.UI Engineer Agent**
- **Purpose**: Frontend and UI/UX development
- **Capabilities**: Component generation, responsive design, accessibility (WCAG 2.1 AA)
- **Usage**: `executeTask('dev_ui', { type: 'generate_ui', config: {...} })`

### **🧠 LLM Architect Agent**
- **Purpose**: AI automation and prompt engineering
- **Capabilities**: Workflow automation, prompt optimization, safety policies
- **Usage**: `executeTask('llm_architect', { type: 'design_automation', config: {...} })`

### **🧪 QA Tester Agent**
- **Purpose**: Quality assurance and testing
- **Capabilities**: Test generation, quality validation, performance analysis
- **Usage**: `executeTask('qa_tester', { type: 'validate_quality', config: {...} })`

### **👔 Manager Agent**
- **Purpose**: Project coordination and compliance
- **Capabilities**: Task orchestration, resource management, enterprise compliance
- **Usage**: `executeTask('manager', { type: 'coordinate_project', config: {...} })`

## 💡 Usage Examples

### **Basic Agent Execution**
```typescript
import { AurixFramework } from '@aurix/framework';

const aurix = new AurixFramework();

// Execute single task
const result = await aurix.executeTask('dev_ui', {
  type: 'generate_ui',
  config: {
    template: 'atomic_design',
    framework: 'react',
    accessibility: true
  }
});

console.log('UI Generated:', result.data);
```

### **Task Delegation**
```typescript
// Delegate task between agents
const delegationResult = await aurix.delegateTask(
  'architect',  // from agent
  'dev_builder', // to agent
  {
    type: 'implement_feature',
    config: { specification: 'User authentication system' }
  }
);
```

### **Chain Delegation (Pipeline)**
```typescript
const chainResult = await aurix.delegator.delegateChain([
  {
    agent: 'architect',
    task: { type: 'design_architecture', config: { requirements: 'E-commerce API' } }
  },
  {
    agent: 'dev_builder',
    task: { type: 'implement_feature', config: { feature: 'product_catalog' } }
  },
  {
    agent: 'qa_tester',
    task: { type: 'validate_quality', config: { coverage: 90 } }
  }
]);
```

### **Task Management**
```typescript
// Add tasks to queue with priorities
const taskId = aurix.addTask(
  { type: 'optimize_performance', config: { target: 'api_response_time' } },
  'dev_builder',
  'high' // priority
);

// Tasks are automatically processed based on priority and dependencies
```

### **Memory Management**
```typescript
// Store project data
await aurix.memory.setProjectMemory('my_project', {
  architecture: 'microservices',
  components: ['auth', 'catalog', 'orders'],
  status: 'in_development'
});

// Retrieve project data
const projectData = await aurix.memory.getProjectMemory('my_project');

// Agent-specific memory
await aurix.memory.setAgentMemory('dev_ui', {
  preferences: { theme: 'dark', verbosity: 'detailed' },
  executionHistory: [...]
});
```

## 🎯 Cursor AI Rules

Aurix 2.0 includes specialized training rules in `.cursor/rules/`:

- **`frontend.mdc`**: Atomic Design, responsive patterns, accessibility
- **`ux.mdc`**: Design systems, WCAG 2.1 AA, user experience patterns  
- **`igniter-controllers.mdc`**: Type-safe controller patterns
- **`middleware.mdc`**: Logging, authentication, error handling

These rules automatically guide AI development to follow best practices.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- executor.test.ts

# Watch mode
npm test -- --watch
```

## 📊 Statistics & Monitoring

```typescript
const stats = aurix.getStats();

console.log('Framework Statistics:', {
  executor: stats.executor,     // Execution metrics
  memory: stats.memory,         // Memory usage and hit rates
  delegation: stats.delegation, // Delegation success rates
  tasks: stats.tasks           // Task queue statistics
});
```

## 🔧 Configuration

```typescript
const aurix = new AurixFramework({
  memoryConfig: {
    maxCacheSize: 100,
    persistToDisk: true,
    autoCleanup: true,
    cleanupInterval: 30 * 60 * 1000 // 30 minutes
  },
  taskManagerConfig: {
    maxConcurrentTasks: 5,
    defaultTimeout: 30000,
    enablePriorityQueue: true,
    enableDependencyResolution: true
  }
});
```

## 🚀 Advanced Features

### **Batch Processing**
```typescript
const results = await aurix.executor.executeBatch([
  { agent: 'architect', task: { type: 'analyze_requirements', config: {} } },
  { agent: 'dev_ui', task: { type: 'generate_ui', config: {} } },
  { agent: 'qa_tester', task: { type: 'validate_quality', config: {} } }
]);
```

### **Parallel Execution with Concurrency Control**
```typescript
const results = await aurix.executor.executeParallel(tasks, 3); // Max 3 concurrent
```

### **Memory Export/Import**
```typescript
// Export project memory
const exported = await aurix.memory.exportMemory('project_id');

// Import to another instance
await aurix.memory.importMemory(exported);
```

### **Memory Optimization**
```typescript
const optimization = await aurix.memory.optimizeMemory();
console.log(`Saved ${optimization.saved} duplicate entries`);
```

## 🏢 Enterprise Features

- **Compliance**: Automatic enterprise standard enforcement
- **Audit Trail**: Complete execution history and logging
- **Resource Management**: Automatic memory and CPU optimization
- **Security**: Input validation and output sanitization
- **Scalability**: Horizontal scaling support with load balancing

## 🔌 Extensibility

### **Add Custom Agent**
```typescript
aurix.provider.registerAgent({
  name: 'custom_agent',
  execute: async (task) => {
    // Your custom logic
    return { success: true, data: 'Custom result' };
  },
  validate: (task) => task.type === 'custom_task'
});
```

### **Add Custom Memory Type**
```typescript
await aurix.memory.setState({
  projectId: 'custom_memory',
  data: { customField: 'value' },
  timestamp: new Date(),
  version: 1,
  metadata: { tags: ['custom'] }
});
```

## 📈 Performance

- **Memory Efficient**: Automatic cache management and cleanup
- **Fast Execution**: Optimized agent routing and parallel processing
- **Scalable**: Handles thousands of concurrent tasks
- **Offline Ready**: Full functionality without internet dependency

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📚 **Tutorial Completo**

**🎯 [Leia o Tutorial Completo](docs/TUTORIAL.md)** - Guia passo a passo para usar o Aurix 2.0

## 🆘 Support

- 📖 **Documentation**: [docs/](./docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Guimp-Code/Aurix/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Guimp-Code/Aurix/discussions)

---

**Built with ❤️ by the Aurix Team**

*Empowering developers with intelligent automation since 2024*