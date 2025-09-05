import { AgentExecutor } from '../src/agents/executor';
import { AgentProvider } from '../src/agents/providers';
import { Task } from '../src/agents/types';

describe('AgentExecutor', () => {
  let executor: AgentExecutor;
  let provider: AgentProvider;

  beforeEach(() => {
    provider = new AgentProvider();
    executor = new AgentExecutor(provider);
  });

  test('should execute task successfully', async () => {
    const task: Task = {
      type: 'generate_ui',
      config: { template: 'atomic_design' }
    };

    const result = await executor.executeTask('dev_ui', task);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.metadata?.agent).toBe('dev_ui');
    expect(result.metadata?.executionTime).toBeGreaterThan(0);
  });

  test('should handle non-existent agent', async () => {
    const task: Task = {
      type: 'test_task',
      config: {}
    };

    const result = await executor.executeTask('non_existent_agent', task);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  test('should execute batch tasks', async () => {
    const tasks = [
      { agent: 'architect', task: { type: 'analyze_requirements', config: {} } },
      { agent: 'dev_ui', task: { type: 'generate_ui', config: {} } },
      { agent: 'qa_tester', task: { type: 'validate_quality', config: {} } }
    ];

    const results = await executor.executeBatch(tasks);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
  });

  test('should track execution history', async () => {
    const task: Task = {
      type: 'test_task',
      config: {}
    };

    await executor.executeTask('architect', task);
    await executor.executeTask('dev_ui', task);

    const history = executor.getExecutionHistory();
    expect(history).toHaveLength(2);
    expect(history[0].result.metadata?.agent).toBeDefined();
  });

  test('should calculate execution stats', async () => {
    const task: Task = {
      type: 'test_task',
      config: {}
    };

    await executor.executeTask('architect', task);
    await executor.executeTask('dev_ui', task);

    const stats = executor.getExecutionStats();
    expect(stats.totalExecutions).toBe(2);
    expect(stats.successRate).toBe(100);
    expect(stats.averageExecutionTime).toBeGreaterThan(0);
    expect(stats.agentUsage).toHaveProperty('architect');
    expect(stats.agentUsage).toHaveProperty('dev_ui');
  });

  test('should handle parallel execution with concurrency limit', async () => {
    const tasks = Array.from({ length: 10 }, (_, i) => ({
      agent: 'architect',
      task: { type: 'test_task', config: { index: i } }
    }));

    const startTime = Date.now();
    const results = await executor.executeParallel(tasks, 3);
    const endTime = Date.now();

    expect(results).toHaveLength(10);
    expect(results.every(r => r.success)).toBe(true);
    
    // Should take longer than sequential due to concurrency limit
    expect(endTime - startTime).toBeGreaterThan(100);
  });

  test('should list available agents', () => {
    const agents = executor.listAvailableAgents();
    
    expect(agents).toContain('architect');
    expect(agents).toContain('dev_builder');
    expect(agents).toContain('dev_ui');
    expect(agents).toContain('llm_architect');
    expect(agents).toContain('qa_tester');
    expect(agents).toContain('manager');
  });

  test('should check agent availability', () => {
    expect(executor.isAgentAvailable('architect')).toBe(true);
    expect(executor.isAgentAvailable('non_existent')).toBe(false);
  });
});


