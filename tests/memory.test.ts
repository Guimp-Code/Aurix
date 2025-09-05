import { MemoryManager } from '../src/memory/manager';
import { FileSystemStorage } from '../src/memory/fs';
import { MemoryState } from '../src/memory/types';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  const testStoragePath = './test_memory';

  beforeEach(() => {
    memoryManager = new MemoryManager({
      maxCacheSize: 10,
      persistToDisk: true,
      autoCleanup: false // Disable for tests
    }, testStoragePath);
  });

  afterEach(async () => {
    memoryManager.destroy();
    // Clean up test files
    if (await fs.pathExists(testStoragePath)) {
      await fs.remove(testStoragePath);
    }
  });

  test('should store and retrieve memory state', async () => {
    const state: MemoryState = {
      projectId: 'test_project',
      data: { message: 'Hello Aurix!' },
      timestamp: new Date(),
      version: 1
    };

    await memoryManager.setState(state);
    const retrieved = await memoryManager.getState('test_project');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.data.message).toBe('Hello Aurix!');
    expect(retrieved?.version).toBe(2); // Should increment
  });

  test('should return null for non-existent state', async () => {
    const retrieved = await memoryManager.getState('non_existent');
    expect(retrieved).toBeNull();
  });

  test('should handle cache management', async () => {
    // Fill cache beyond limit
    for (let i = 0; i < 15; i++) {
      await memoryManager.setState({
        projectId: `project_${i}`,
        data: { index: i },
        timestamp: new Date(),
        version: 1
      });
    }

    const stats = memoryManager.getStats();
    expect(stats.cacheSize).toBeLessThanOrEqual(10); // Should respect max cache size
  });

  test('should query states with filters', async () => {
    const userId = 'user123';
    
    // Add multiple states
    await memoryManager.setState({
      projectId: 'project1',
      data: { type: 'ui' },
      timestamp: new Date(),
      version: 1,
      metadata: { userId, tags: ['ui', 'frontend'] }
    });

    await memoryManager.setState({
      projectId: 'project2',
      data: { type: 'backend' },
      timestamp: new Date(),
      version: 1,
      metadata: { userId, tags: ['backend', 'api'] }
    });

    // Query by user
    const userStates = await memoryManager.queryStates({ userId });
    expect(userStates).toHaveLength(2);

    // Query by tags
    const uiStates = await memoryManager.queryStates({ tags: ['ui'] });
    expect(uiStates).toHaveLength(1);
    expect(uiStates[0].data.type).toBe('ui');
  });

  test('should handle project memory', async () => {
    const projectData = {
      architecture: 'microservices',
      components: ['auth', 'user-management'],
      status: 'in-progress'
    };

    await memoryManager.setProjectMemory('my_project', projectData, 'user123');
    const retrieved = await memoryManager.getProjectMemory('my_project');

    expect(retrieved.architecture).toBe('microservices');
    expect(retrieved.components).toHaveLength(2);
  });

  test('should handle agent memory', async () => {
    const agentData = {
      executionHistory: [
        { taskType: 'generate_ui', result: 'success', executionTime: 1500, timestamp: new Date() }
      ],
      preferences: { theme: 'dark', verbosity: 'high' }
    };

    await memoryManager.setAgentMemory('dev_ui', agentData, 'project123');
    const retrieved = await memoryManager.getAgentMemory('dev_ui', 'project123');

    expect(retrieved.executionHistory).toHaveLength(1);
    expect(retrieved.preferences.theme).toBe('dark');
  });

  test('should handle user memory', async () => {
    const userData = {
      preferences: { language: 'pt-BR', theme: 'dark' },
      projects: ['project1', 'project2'],
      analytics: { totalSessions: 42, favoriteAgents: ['dev_ui', 'architect'] }
    };

    await memoryManager.setUserMemory('user123', userData);
    const retrieved = await memoryManager.getUserMemory('user123');

    expect(retrieved.preferences.language).toBe('pt-BR');
    expect(retrieved.projects).toHaveLength(2);
    expect(retrieved.analytics.totalSessions).toBe(42);
  });

  test('should delete memory state', async () => {
    const state: MemoryState = {
      projectId: 'to_delete',
      data: { temp: true },
      timestamp: new Date(),
      version: 1
    };

    await memoryManager.setState(state);
    expect(await memoryManager.getState('to_delete')).not.toBeNull();

    const deleted = await memoryManager.deleteState('to_delete');
    expect(deleted).toBe(true);
    expect(await memoryManager.getState('to_delete')).toBeNull();
  });

  test('should optimize memory', async () => {
    // Add duplicate entries with different versions
    await memoryManager.setState({
      projectId: 'duplicate',
      data: { version: 1 },
      timestamp: new Date(),
      version: 1
    });

    await memoryManager.setState({
      projectId: 'duplicate',
      data: { version: 2 },
      timestamp: new Date(),
      version: 2
    });

    const optimizationResult = await memoryManager.optimizeMemory();
    expect(optimizationResult.saved).toBeGreaterThanOrEqual(0);
  });

  test('should export and import memory', async () => {
    const states = [
      {
        projectId: 'export_test_1',
        data: { test: 1 },
        timestamp: new Date(),
        version: 1
      },
      {
        projectId: 'export_test_2',
        data: { test: 2 },
        timestamp: new Date(),
        version: 1
      }
    ];

    // Import states
    await memoryManager.importMemory(states);

    // Export and verify
    const exported = await memoryManager.exportMemory();
    expect(exported.length).toBeGreaterThanOrEqual(2);
    
    const testStates = exported.filter(s => s.projectId.startsWith('export_test_'));
    expect(testStates).toHaveLength(2);
  });
});

describe('FileSystemStorage', () => {
  let storage: FileSystemStorage;
  const testPath = './test_fs_storage';

  beforeEach(() => {
    storage = new FileSystemStorage(testPath, false); // Disable compression for tests
  });

  afterEach(async () => {
    if (await fs.pathExists(testPath)) {
      await fs.remove(testPath);
    }
  });

  test('should save and load state from filesystem', async () => {
    const state: MemoryState = {
      projectId: 'fs_test',
      data: { filesystem: true },
      timestamp: new Date(),
      version: 1
    };

    await storage.saveState(state);
    const loaded = await storage.loadState('fs_test');

    expect(loaded).not.toBeNull();
    expect(loaded?.data.filesystem).toBe(true);
  });

  test('should return null for non-existent file', async () => {
    const loaded = await storage.loadState('non_existent');
    expect(loaded).toBeNull();
  });

  test('should delete state file', async () => {
    const state: MemoryState = {
      projectId: 'to_delete_fs',
      data: { temp: true },
      timestamp: new Date(),
      version: 1
    };

    await storage.saveState(state);
    expect(await storage.loadState('to_delete_fs')).not.toBeNull();

    const deleted = await storage.deleteState('to_delete_fs');
    expect(deleted).toBe(true);
    expect(await storage.loadState('to_delete_fs')).toBeNull();
  });

  test('should get storage statistics', async () => {
    const state: MemoryState = {
      projectId: 'stats_test',
      data: { large: 'data'.repeat(1000) },
      timestamp: new Date(),
      version: 1
    };

    await storage.saveState(state);
    const stats = await storage.getStorageStats();

    expect(stats.totalFiles).toBeGreaterThan(0);
    expect(stats.totalSize).toBeGreaterThan(0);
    expect(stats.oldestEntry).toBeInstanceOf(Date);
    expect(stats.newestEntry).toBeInstanceOf(Date);
  });
});


