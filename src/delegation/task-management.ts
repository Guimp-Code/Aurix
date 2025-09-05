import { Task, Result } from '../agents/types';
import { DelegationConfig, DelegationResult } from './agent-delegation';

export interface ManagedTask {
  id: string;
  task: Task;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  assignedAgent: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: DelegationResult;
  dependencies?: string[]; // IDs of tasks that must complete first
  metadata?: {
    projectId?: string;
    userId?: string;
    tags?: string[];
    estimatedDuration?: number;
  };
}

export interface TaskManagerConfig {
  maxConcurrentTasks: number;
  defaultTimeout: number;
  retryAttempts: number;
  enablePriorityQueue: boolean;
  enableDependencyResolution: boolean;
}

export class TaskManager {
  private tasks: Map<string, ManagedTask> = new Map();
  private runningTasks: Set<string> = new Set();
  private completedTasks: Set<string> = new Set();
  private config: TaskManagerConfig;
  private processingInterval?: NodeJS.Timeout;

  constructor(config?: Partial<TaskManagerConfig>) {
    this.config = {
      maxConcurrentTasks: 5,
      defaultTimeout: 30000,
      retryAttempts: 3,
      enablePriorityQueue: true,
      enableDependencyResolution: true,
      ...config
    };

    this.startProcessing();
  }

  addTask(
    task: Task,
    assignedAgent: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    dependencies?: string[],
    metadata?: ManagedTask['metadata']
  ): string {
    const taskId = this.generateTaskId();
    
    const managedTask: ManagedTask = {
      id: taskId,
      task,
      status: 'pending',
      assignedAgent,
      priority,
      createdAt: new Date(),
      dependencies,
      metadata
    };

    this.tasks.set(taskId, managedTask);
    
    console.log(`📝 Task added: ${taskId} (${priority}) → ${assignedAgent}`);
    
    return taskId;
  }

  async runTask(taskId: string): Promise<DelegationResult | null> {
    const managedTask = this.tasks.get(taskId);
    
    if (!managedTask) {
      console.error(`❌ Task not found: ${taskId}`);
      return null;
    }

    if (managedTask.status !== 'pending') {
      console.warn(`⚠️ Task ${taskId} is not in pending state: ${managedTask.status}`);
      return managedTask.result || null;
    }

    // Check dependencies
    if (this.config.enableDependencyResolution && managedTask.dependencies) {
      const uncompletedDeps = managedTask.dependencies.filter(depId => {
        const depTask = this.tasks.get(depId);
        return !depTask || depTask.status !== 'completed';
      });

      if (uncompletedDeps.length > 0) {
        console.log(`⏳ Task ${taskId} waiting for dependencies: ${uncompletedDeps.join(', ')}`);
        return null;
      }
    }

    // Check concurrency limit
    if (this.runningTasks.size >= this.config.maxConcurrentTasks) {
      console.log(`🚦 Task ${taskId} waiting - max concurrent tasks reached`);
      return null;
    }

    // Update status and start execution
    managedTask.status = 'running';
    managedTask.startedAt = new Date();
    this.runningTasks.add(taskId);

    console.log(`🏃 Running task: ${taskId} → ${managedTask.assignedAgent}`);

    try {
      // Import delegation here to avoid circular dependency
      const { delegateTask } = await import('./agent-delegation');
      
      const delegationConfig: DelegationConfig = {
        fromAgent: 'task_manager',
        toAgent: managedTask.assignedAgent,
        task: managedTask.task,
        timeout: this.config.defaultTimeout,
        retries: this.config.retryAttempts
      };

      const result = await delegateTask(delegationConfig);
      
      // Update task with result
      managedTask.result = result;
      managedTask.completedAt = new Date();
      managedTask.status = result.success ? 'completed' : 'failed';
      
      this.runningTasks.delete(taskId);
      this.completedTasks.add(taskId);

      console.log(`${result.success ? '✅' : '❌'} Task ${taskId} ${result.success ? 'completed' : 'failed'}`);
      
      return result;

    } catch (error) {
      managedTask.status = 'failed';
      managedTask.completedAt = new Date();
      managedTask.result = {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
        delegation: {
          fromAgent: 'task_manager',
          toAgent: managedTask.assignedAgent,
          startTime: managedTask.startedAt!,
          endTime: new Date(),
          retryCount: 0
        }
      };

      this.runningTasks.delete(taskId);
      
      console.error(`❌ Task ${taskId} failed with error:`, error instanceof Error ? error.message : String(error));
      
      return managedTask.result;
    }
  }

  cancelTask(taskId: string): boolean {
    const managedTask = this.tasks.get(taskId);
    
    if (!managedTask) {
      return false;
    }

    if (managedTask.status === 'running') {
      this.runningTasks.delete(taskId);
    }

    managedTask.status = 'cancelled';
    managedTask.completedAt = new Date();
    
    console.log(`🚫 Task cancelled: ${taskId}`);
    
    return true;
  }

  getTask(taskId: string): ManagedTask | undefined {
    return this.tasks.get(taskId);
  }

  getTasks(status?: ManagedTask['status']): ManagedTask[] {
    const allTasks = Array.from(this.tasks.values());
    
    if (status) {
      return allTasks.filter(task => task.status === status);
    }
    
    return allTasks;
  }

  getTasksByAgent(agentName: string): ManagedTask[] {
    return Array.from(this.tasks.values()).filter(task => task.assignedAgent === agentName);
  }

  getTasksByProject(projectId: string): ManagedTask[] {
    return Array.from(this.tasks.values()).filter(task => task.metadata?.projectId === projectId);
  }

  // Auto-processing of pending tasks
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processPendingTasks().catch(error => {
        console.error('Task processing error:', error);
      });
    }, 1000); // Check every second
  }

  private async processPendingTasks(): Promise<void> {
    const pendingTasks = this.getTasks('pending');
    
    if (pendingTasks.length === 0) {
      return;
    }

    // Sort by priority if enabled
    if (this.config.enablePriorityQueue) {
      pendingTasks.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        return bPriority - aPriority;
      });
    }

    // Try to run as many tasks as possible within concurrency limit
    for (const task of pendingTasks) {
      if (this.runningTasks.size >= this.config.maxConcurrentTasks) {
        break;
      }

      await this.runTask(task.id);
    }
  }

  // Batch operations
  async runAllPending(): Promise<DelegationResult[]> {
    const pendingTasks = this.getTasks('pending');
    const results: DelegationResult[] = [];

    for (const task of pendingTasks) {
      const result = await this.runTask(task.id);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  // Statistics
  getStats() {
    const tasks = Array.from(this.tasks.values());
    
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      successRate: 0,
      averageExecutionTime: 0,
      agentWorkload: {} as Record<string, number>
    };

    const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed');
    
    if (completedTasks.length > 0) {
      stats.successRate = (stats.completed / completedTasks.length) * 100;
      
      const totalTime = completedTasks.reduce((sum, task) => {
        if (task.startedAt && task.completedAt) {
          return sum + (task.completedAt.getTime() - task.startedAt.getTime());
        }
        return sum;
      }, 0);
      
      stats.averageExecutionTime = totalTime / completedTasks.length;
    }

    // Agent workload
    tasks.forEach(task => {
      stats.agentWorkload[task.assignedAgent] = (stats.agentWorkload[task.assignedAgent] || 0) + 1;
    });

    return stats;
  }

  // Cleanup
  cleanup(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    // Clean up old completed tasks (keep last 100)
    const completedTaskIds = Array.from(this.completedTasks);
    if (completedTaskIds.length > 100) {
      const toRemove = completedTaskIds.slice(0, completedTaskIds.length - 100);
      toRemove.forEach(taskId => {
        this.tasks.delete(taskId);
        this.completedTasks.delete(taskId);
      });
    }
  }

  destroy(): void {
    this.cleanup();
    this.tasks.clear();
    this.runningTasks.clear();
    this.completedTasks.clear();
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
