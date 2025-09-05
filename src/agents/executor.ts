import { Task, Result, Agent } from './types';
import { AgentProvider } from './providers';

export class AgentExecutor {
  private provider: AgentProvider;
  private executionQueue: Map<string, Promise<Result>> = new Map();
  private executionHistory: Array<{ task: Task; result: Result; timestamp: Date }> = [];

  constructor(provider?: AgentProvider) {
    this.provider = provider || new AgentProvider();
  }

  async executeTask(agentName: string, task: Task): Promise<Result> {
    const taskId = this.generateTaskId(agentName, task);
    
    // Check if task is already executing
    if (this.executionQueue.has(taskId)) {
      return await this.executionQueue.get(taskId)!;
    }

    // Create execution promise
    const executionPromise = this.performExecution(agentName, task);
    this.executionQueue.set(taskId, executionPromise);

    try {
      const result = await executionPromise;
      
      // Store in history
      this.executionHistory.push({
        task,
        result,
        timestamp: new Date()
      });

      // Keep history limited to last 100 executions
      if (this.executionHistory.length > 100) {
        this.executionHistory.shift();
      }

      return result;
    } finally {
      // Remove from queue when done
      this.executionQueue.delete(taskId);
    }
  }

  private async performExecution(agentName: string, task: Task): Promise<Result> {
    const agent = this.provider.getAgent(agentName);
    
    if (!agent) {
      return {
        success: false,
        data: null,
        error: `Agent '${agentName}' not found`,
        metadata: {
          agent: agentName,
          executionTime: 0,
          timestamp: new Date()
        }
      };
    }

    // Validate task if agent has validation
    if (agent.validate && !agent.validate(task)) {
      return {
        success: false,
        data: null,
        error: `Task validation failed for agent '${agentName}'`,
        metadata: {
          agent: agentName,
          executionTime: 0,
          timestamp: new Date()
        }
      };
    }

    const startTime = Date.now();

    try {
      // Execute the task
      const result = await agent.execute(task);
      
      // Ensure result has proper metadata
      if (!result.metadata) {
        result.metadata = {
          agent: agentName,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          agent: agentName,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        }
      };
    }
  }

  // Batch execution for multiple tasks
  async executeBatch(tasks: Array<{ agent: string; task: Task }>): Promise<Result[]> {
    const promises = tasks.map(({ agent, task }) => 
      this.executeTask(agent, task)
    );

    return await Promise.all(promises);
  }

  // Parallel execution with concurrency limit
  async executeParallel(
    tasks: Array<{ agent: string; task: Task }>,
    concurrency: number = 3
  ): Promise<Result[]> {
    const results: Result[] = [];
    
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      const batchResults = await this.executeBatch(batch);
      results.push(...batchResults);
    }

    return results;
  }

  // Get execution statistics
  getExecutionStats() {
    const stats = {
      totalExecutions: this.executionHistory.length,
      successRate: 0,
      averageExecutionTime: 0,
      agentUsage: {} as Record<string, number>
    };

    if (this.executionHistory.length > 0) {
      const successful = this.executionHistory.filter(h => h.result.success).length;
      stats.successRate = (successful / this.executionHistory.length) * 100;

      const totalTime = this.executionHistory.reduce((sum, h) => 
        sum + (h.result.metadata?.executionTime || 0), 0
      );
      stats.averageExecutionTime = totalTime / this.executionHistory.length;

      // Count agent usage
      this.executionHistory.forEach(h => {
        const agent = h.result.metadata?.agent || 'unknown';
        stats.agentUsage[agent] = (stats.agentUsage[agent] || 0) + 1;
      });
    }

    return stats;
  }

  // Get recent execution history
  getExecutionHistory(limit: number = 10) {
    return this.executionHistory
      .slice(-limit)
      .reverse(); // Most recent first
  }

  // Check if agent is available
  isAgentAvailable(agentName: string): boolean {
    return this.provider.getAgent(agentName) !== undefined;
  }

  // List all available agents
  listAvailableAgents(): string[] {
    return this.provider.listAgents();
  }

  private generateTaskId(agentName: string, task: Task): string {
    const taskData = JSON.stringify({ agent: agentName, type: task.type, config: task.config });
    return Buffer.from(taskData).toString('base64').substring(0, 16);
  }
}

// Convenience function for single task execution
export async function executeTask(agentName: string, task: Task): Promise<Result> {
  const executor = new AgentExecutor();
  return await executor.executeTask(agentName, task);
}
