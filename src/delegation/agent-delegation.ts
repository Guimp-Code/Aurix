import { executeTask } from '../agents/executor';
import { Task, Result } from '../agents/types';
import { MemoryManager } from '../memory/manager';

export interface DelegationConfig {
  fromAgent: string;
  toAgent: string;
  task: Task;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  timeout?: number; // milliseconds
  retries?: number;
}

export interface DelegationResult extends Result {
  delegation: {
    fromAgent: string;
    toAgent: string;
    startTime: Date;
    endTime: Date;
    retryCount: number;
  };
}

export class AgentDelegator {
  private memoryManager: MemoryManager;
  private delegationQueue: Map<string, DelegationConfig> = new Map();
  private activeDelegations: Map<string, Promise<DelegationResult>> = new Map();
  private delegationHistory: DelegationResult[] = [];

  constructor(memoryManager?: MemoryManager) {
    this.memoryManager = memoryManager || new MemoryManager();
  }

  async delegateTask(config: DelegationConfig): Promise<DelegationResult> {
    const delegationId = this.generateDelegationId(config);
    
    // Check if already delegating
    if (this.activeDelegations.has(delegationId)) {
      return await this.activeDelegations.get(delegationId)!;
    }

    // Create delegation promise
    const delegationPromise = this.performDelegation(config);
    this.activeDelegations.set(delegationId, delegationPromise);

    try {
      const result = await delegationPromise;
      
      // Store in history
      this.delegationHistory.push(result);
      
      // Keep history limited
      if (this.delegationHistory.length > 1000) {
        this.delegationHistory.shift();
      }

      // Store in memory
      await this.memoryManager.setAgentMemory(
        'delegation_history',
        { delegations: this.delegationHistory.slice(-100) }
      );

      return result;
    } finally {
      this.activeDelegations.delete(delegationId);
    }
  }

  private async performDelegation(config: DelegationConfig): Promise<DelegationResult> {
    const startTime = new Date();
    let retryCount = 0;
    const maxRetries = config.retries || 3;
    const timeout = config.timeout || 30000; // 30 seconds default

    console.log(`🔄 Delegating from ${config.fromAgent} to ${config.toAgent}: ${config.task.type}`);

    while (retryCount <= maxRetries) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Delegation timeout')), timeout);
        });

        // Execute task with timeout
        const taskPromise = executeTask(config.toAgent, config.task);
        const result = await Promise.race([taskPromise, timeoutPromise]);

        const endTime = new Date();

        const delegationResult: DelegationResult = {
          ...result,
          delegation: {
            fromAgent: config.fromAgent,
            toAgent: config.toAgent,
            startTime,
            endTime,
            retryCount
          }
        };

        console.log(`✅ Delegation completed: ${config.fromAgent} → ${config.toAgent} (${endTime.getTime() - startTime.getTime()}ms)`);
        
        return delegationResult;

      } catch (error) {
        retryCount++;
        console.warn(`⚠️ Delegation retry ${retryCount}/${maxRetries}: ${error instanceof Error ? error.message : String(error)}`);
        
        if (retryCount > maxRetries) {
          const endTime = new Date();
          
          return {
            success: false,
            data: null,
            error: `Delegation failed after ${maxRetries} retries: ${error instanceof Error ? error.message : String(error)}`,
            delegation: {
              fromAgent: config.fromAgent,
              toAgent: config.toAgent,
              startTime,
              endTime,
              retryCount
            }
          };
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    throw new Error('Unexpected delegation flow');
  }

  // Batch delegation
  async delegateBatch(configs: DelegationConfig[]): Promise<DelegationResult[]> {
    const promises = configs.map(config => this.delegateTask(config));
    return await Promise.all(promises);
  }

  // Priority-based delegation queue
  async enqueueDelegation(config: DelegationConfig): Promise<string> {
    const delegationId = this.generateDelegationId(config);
    this.delegationQueue.set(delegationId, config);
    
    // Process queue immediately
    this.processQueue();
    
    return delegationId;
  }

  private async processQueue(): Promise<void> {
    // Sort by priority
    const sortedConfigs = Array.from(this.delegationQueue.values()).sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
    });

    // Process up to 5 delegations concurrently
    const concurrent = sortedConfigs.slice(0, 5);
    
    for (const config of concurrent) {
      const delegationId = this.generateDelegationId(config);
      this.delegationQueue.delete(delegationId);
      
      // Execute without waiting (fire and forget for queue processing)
      this.delegateTask(config).catch(error => {
        console.error(`Queue delegation error:`, error);
      });
    }
  }

  // Chain delegations (pipeline)
  async delegateChain(chain: Array<{ agent: string; task: Task }>): Promise<DelegationResult[]> {
    const results: DelegationResult[] = [];
    let previousResult: any = null;

    for (let i = 0; i < chain.length; i++) {
      const { agent, task } = chain[i];
      
      // Pass previous result as input to next task
      if (previousResult && i > 0) {
        task.config.previousResult = previousResult;
      }

      const config: DelegationConfig = {
        fromAgent: i === 0 ? 'manager' : chain[i - 1].agent,
        toAgent: agent,
        task
      };

      const result = await this.delegateTask(config);
      results.push(result);
      
      // If delegation failed, stop chain
      if (!result.success) {
        console.error(`❌ Chain stopped at ${agent}: ${result.error}`);
        break;
      }

      previousResult = result.data;
    }

    return results;
  }

  // Get delegation statistics
  getDelegationStats() {
    const stats = {
      totalDelegations: this.delegationHistory.length,
      successRate: 0,
      averageTime: 0,
      agentPairs: {} as Record<string, number>,
      activeCount: this.activeDelegations.size,
      queueSize: this.delegationQueue.size
    };

    if (this.delegationHistory.length > 0) {
      const successful = this.delegationHistory.filter(d => d.success).length;
      stats.successRate = (successful / this.delegationHistory.length) * 100;

      const totalTime = this.delegationHistory.reduce((sum, d) => {
        return sum + (d.delegation.endTime.getTime() - d.delegation.startTime.getTime());
      }, 0);
      stats.averageTime = totalTime / this.delegationHistory.length;

      // Count agent pairs
      this.delegationHistory.forEach(d => {
        const pair = `${d.delegation.fromAgent}→${d.delegation.toAgent}`;
        stats.agentPairs[pair] = (stats.agentPairs[pair] || 0) + 1;
      });
    }

    return stats;
  }

  // Get recent delegations
  getRecentDelegations(limit: number = 10): DelegationResult[] {
    return this.delegationHistory.slice(-limit).reverse();
  }

  private generateDelegationId(config: DelegationConfig): string {
    const data = `${config.fromAgent}-${config.toAgent}-${config.task.type}-${Date.now()}`;
    return Buffer.from(data).toString('base64').substring(0, 16);
  }
}

// Convenience functions
export async function delegateTask(config: DelegationConfig): Promise<DelegationResult> {
  const delegator = new AgentDelegator();
  return await delegator.delegateTask(config);
}

export async function delegateChain(chain: Array<{ agent: string; task: Task }>): Promise<DelegationResult[]> {
  const delegator = new AgentDelegator();
  return await delegator.delegateChain(chain);
}
