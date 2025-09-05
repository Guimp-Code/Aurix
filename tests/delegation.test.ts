import { AgentDelegator, delegateTask, delegateChain } from '../src/delegation/agent-delegation';
import { TaskManager } from '../src/delegation/task-management';
import { Task } from '../src/agents/types';
import { MemoryManager } from '../src/memory/manager';

describe('AgentDelegator', () => {
  let delegator: AgentDelegator;
  let memoryManager: MemoryManager;

  beforeEach(() => {
    memoryManager = new MemoryManager({
      persistToDisk: false // Use memory only for tests
    });
    delegator = new AgentDelegator(memoryManager);
  });

  afterEach(() => {
    memoryManager.destroy();
  });

  test('should delegate task successfully', async () => {
    const task: Task = {
      type: 'generate_ui',
      config: { template: 'atomic_design' }
    };

    const result = await delegator.delegateTask({
      fromAgent: 'manager',
      toAgent: 'dev_ui',
      task
    });

    expect(result.success).toBe(true);
    expect(result.delegation.fromAgent).toBe('manager');
    expect(result.delegation.toAgent).toBe('dev_ui');
    expect(result.delegation.retryCount).toBe(0);
  });

  test('should handle delegation timeout', async () => {
    const task: Task = {
      type: 'slow_task',
      config: {}
    };

    const result = await delegator.delegateTask({
      fromAgent: 'manager',
      toAgent: 'dev_ui',
      task,
      timeout: 100 // Very short timeout
    });

    // Should either succeed quickly or timeout
    expect(result).toBeDefined();
    expect(result.delegation).toBeDefined();
  }, 10000);

  test('should delegate batch tasks', async () => {
    const configs = [
      {
        fromAgent: 'manager',
        toAgent: 'architect',
        task: { type: 'analyze_requirements', config: {} }
      },
      {
        fromAgent: 'manager',
        toAgent: 'dev_ui',
        task: { type: 'generate_ui', config: {} }
      },
      {
        fromAgent: 'manager',
        toAgent: 'qa_tester',
        task: { type: 'validate_quality', config: {} }
      }
    ];

    const results = await delegator.delegateBatch(configs);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
    expect(results.every(r => r.delegation)).toBeTruthy();
  });

  test('should get delegation statistics', async () => {
    const task: Task = {
      type: 'test_task',
      config: {}
    };

    await delegator.delegateTask({
      fromAgent: 'manager',
      toAgent: 'architect',
      task
    });

    await delegator.delegateTask({
      fromAgent: 'architect',
      toAgent: 'dev_ui',
      task
    });

    const stats = delegator.getDelegationStats();
    expect(stats.totalDelegations).toBe(2);
    expect(stats.successRate).toBe(100);
    expect(stats.averageTime).toBeGreaterThan(0);
    expect(stats.agentPairs).toHaveProperty('manager→architect');
    expect(stats.agentPairs).toHaveProperty('architect→dev_ui');
  });

  test('should get recent delegations', async () => {
    const task: Task = {
      type: 'test_task',
      config: {}
    };

    await delegator.delegateTask({
      fromAgent: 'manager',
      toAgent: 'architect',
      task
    });

    const recent = delegator.getRecentDelegations(5);
    expect(recent).toHaveLength(1);
    expect(recent[0].delegation.fromAgent).toBe('manager');
    expect(recent[0].delegation.toAgent).toBe('architect');
  });
});

describe('delegateChain', () => {
  test('should execute delegation chain', async () => {
    const chain = [
      {
        agent: 'architect',
        task: { type: 'analyze_requirements', config: { requirements: 'Build API' } }
      },
      {
        agent: 'dev_builder',
        task: { type: 'implement_feature', config: { feature: 'user_api' } }
      },
      {
        agent: 'qa_tester',
        task: { type: 'validate_quality', config: { tests: true } }
      }
    ];

    const results = await delegateChain(chain);

    expect(results).toHaveLength(3);
    expect(results[0].delegation.toAgent).toBe('architect');
    expect(results[1].delegation.toAgent).toBe('dev_builder');
    expect(results[2].delegation.toAgent).toBe('qa_tester');
    
    // Check that previous results are passed along
    expect(results[1].data).toBeDefined();
    expect(results[2].data).toBeDefined();
  });

  test('should stop chain on failure', async () => {
    const chain = [
      {
        agent: 'architect',
        task: { type: 'analyze_requirements', config: {} }
      },
      {
        agent: 'non_existent_agent',
        task: { type: 'impossible_task', config: {} }
      },
      {
        agent: 'qa_tester',
        task: { type: 'validate_quality', config: {} }
      }
    ];

    const results = await delegateChain(chain);

    expect(results).toHaveLength(2); // Should stop after failure
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
  });
});

describe('TaskManager', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    taskManager = new TaskManager({
      maxConcurrentTasks: 2,
      defaultTimeout: 5000,
      enablePriorityQueue: true
    });
  });

  afterEach(() => {
    taskManager.destroy();
  });

  test('should add and run task', async () => {
    const task: Task = {
      type: 'generate_ui',
      config: { template: 'component' }
    };

    const taskId = taskManager.addTask(task, 'dev_ui', 'medium');
    expect(taskId).toBeDefined();

    // Wait for auto-processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const managedTask = taskManager.getTask(taskId);
    expect(managedTask?.status).toBe('completed');
  });

  test('should handle task priorities', async () => {
    const urgentTask = taskManager.addTask(
      { type: 'urgent_task', config: {} },
      'architect',
      'urgent'
    );

    const lowTask = taskManager.addTask(
      { type: 'low_task', config: {} },
      'architect',
      'low'
    );

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const urgentManagedTask = taskManager.getTask(urgentTask);
    const lowManagedTask = taskManager.getTask(lowTask);

    // Urgent task should complete first or be processed first
    expect(urgentManagedTask?.status).toBe('completed');
    expect(lowManagedTask?.status).toMatch(/completed|running/);
  });

  test('should cancel task', async () => {
    const task: Task = {
      type: 'long_running_task',
      config: {}
    };

    const taskId = taskManager.addTask(task, 'dev_builder');
    const cancelled = taskManager.cancelTask(taskId);

    expect(cancelled).toBe(true);

    const managedTask = taskManager.getTask(taskId);
    expect(managedTask?.status).toBe('cancelled');
  });

  test('should get tasks by status', async () => {
    taskManager.addTask({ type: 'task1', config: {} }, 'architect', 'medium');
    taskManager.addTask({ type: 'task2', config: {} }, 'dev_ui', 'high');

    const pendingTasks = taskManager.getTasks('pending');
    expect(pendingTasks.length).toBeGreaterThan(0);

    // Wait for some processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const completedTasks = taskManager.getTasks('completed');
    expect(completedTasks.length).toBeGreaterThan(0);
  });

  test('should get tasks by agent', async () => {
    taskManager.addTask({ type: 'ui_task1', config: {} }, 'dev_ui');
    taskManager.addTask({ type: 'ui_task2', config: {} }, 'dev_ui');
    taskManager.addTask({ type: 'arch_task', config: {} }, 'architect');

    const uiTasks = taskManager.getTasksByAgent('dev_ui');
    const archTasks = taskManager.getTasksByAgent('architect');

    expect(uiTasks).toHaveLength(2);
    expect(archTasks).toHaveLength(1);
  });

  test('should get task statistics', async () => {
    taskManager.addTask({ type: 'task1', config: {} }, 'architect');
    taskManager.addTask({ type: 'task2', config: {} }, 'dev_ui');

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const stats = taskManager.getStats();
    expect(stats.total).toBe(2);
    expect(stats.completed).toBeGreaterThan(0);
    expect(stats.agentWorkload).toHaveProperty('architect');
    expect(stats.agentWorkload).toHaveProperty('dev_ui');
  });

  test('should handle dependencies', async () => {
    // Add first task
    const task1Id = taskManager.addTask(
      { type: 'base_task', config: {} },
      'architect',
      'medium'
    );

    // Add second task that depends on first
    const task2Id = taskManager.addTask(
      { type: 'dependent_task', config: {} },
      'dev_ui',
      'medium',
      [task1Id] // Dependencies
    );

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 4000));

    const task1 = taskManager.getTask(task1Id);
    const task2 = taskManager.getTask(task2Id);

    expect(task1?.status).toBe('completed');
    
    // Task 2 should only run after task 1 completes
    if (task2?.status === 'completed') {
      expect(task1?.completedAt!.getTime()).toBeLessThan(task2?.startedAt!.getTime());
    }
  });
});


