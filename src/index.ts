// Core exports
export * from './agents/executor';
export * from './agents/providers';
export * from './agents/types';

export * from './memory/manager';
export * from './memory/fs';
export * from './memory/types';

export * from './delegation/agent-delegation';
export * from './delegation/task-management';

// Main Aurix Framework class
import { AgentExecutor } from './agents/executor';
import { AgentProvider } from './agents/providers';
import { MemoryManager } from './memory/manager';
import { AgentDelegator } from './delegation/agent-delegation';
import { TaskManager } from './delegation/task-management';
import { Task, Result } from './agents/types';

export class AurixFramework {
  public executor: AgentExecutor;
  public provider: AgentProvider;
  public memory: MemoryManager;
  public delegator: AgentDelegator;
  public taskManager: TaskManager;

  constructor(config?: {
    memoryConfig?: any;
    storagePath?: string;
    taskManagerConfig?: any;
  }) {
    this.provider = new AgentProvider();
    this.executor = new AgentExecutor(this.provider);
    this.memory = new MemoryManager(config?.memoryConfig, config?.storagePath);
    this.delegator = new AgentDelegator(this.memory);
    this.taskManager = new TaskManager(config?.taskManagerConfig);
  }

  // Convenience methods
  async executeTask(agentName: string, task: Task): Promise<Result> {
    return await this.executor.executeTask(agentName, task);
  }

  async delegateTask(fromAgent: string, toAgent: string, task: Task): Promise<any> {
    return await this.delegator.delegateTask({
      fromAgent,
      toAgent,
      task
    });
  }

  async addTask(task: Task, agent: string, priority?: 'low' | 'medium' | 'high' | 'urgent'): Promise<string> {
    return this.taskManager.addTask(task, agent, priority);
  }

  // Get framework statistics
  getStats() {
    return {
      executor: this.executor.getExecutionStats(),
      memory: this.memory.getStats(),
      delegation: this.delegator.getDelegationStats(),
      tasks: this.taskManager.getStats()
    };
  }

  // Shutdown framework
  async shutdown(): Promise<void> {
    this.memory.destroy();
    this.taskManager.destroy();
  }
}

// Rule application function
export async function applyRule(ruleName: string, config: any): Promise<any> {
  // Load .mdc rule and apply (placeholder implementation)
  console.log(`📋 Applying rule: ${ruleName}`);
  
  // In a real implementation, this would:
  // 1. Load the .mdc file from .cursor/rules/
  // 2. Parse the metadata and content
  // 3. Apply the rules to the config
  // 4. Return the modified config
  
  return {
    ...config,
    ruleApplied: ruleName,
    timestamp: new Date()
  };
}

// Default export
export default AurixFramework;
