import { MemoryState, MemoryConfig, MemoryStats, MemoryQuery } from './types';
import { FileSystemStorage } from './fs';

export class MemoryManager {
  private cache = new Map<string, MemoryState>();
  private storage: FileSystemStorage;
  private config: MemoryConfig;
  private stats: MemoryStats;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<MemoryConfig>, storagePath?: string) {
    this.config = {
      maxCacheSize: 100,
      persistToDisk: true,
      autoCleanup: true,
      cleanupInterval: 30 * 60 * 1000, // 30 minutes
      compressionEnabled: true,
      ...config
    };

    this.storage = new FileSystemStorage(storagePath, this.config.compressionEnabled);
    
    this.stats = {
      totalEntries: 0,
      cacheSize: 0,
      diskUsage: 0,
      hitRate: 0,
      lastCleanup: new Date()
    };

    this.initializeCleanup();
  }

  async getState(projectId: string): Promise<MemoryState | null> {
    // Check cache first
    if (this.cache.has(projectId)) {
      this.updateHitRate(true);
      return this.cache.get(projectId)!;
    }

    this.updateHitRate(false);

    // Load from disk if not in cache
    if (this.config.persistToDisk) {
      const state = await this.storage.loadState(projectId);
      
      if (state) {
        // Add to cache
        this.addToCache(projectId, state);
        return state;
      }
    }

    return null;
  }

  async setState(state: MemoryState): Promise<void> {
    // Update version
    state.version = (state.version || 0) + 1;
    state.timestamp = new Date();

    // Add to cache
    this.addToCache(state.projectId, state);

    // Persist to disk if enabled
    if (this.config.persistToDisk) {
      await this.storage.saveState(state);
    }

    this.updateStats();
  }

  async deleteState(projectId: string): Promise<boolean> {
    // Remove from cache
    this.cache.delete(projectId);

    // Remove from disk if enabled
    if (this.config.persistToDisk) {
      return await this.storage.deleteState(projectId);
    }

    this.updateStats();
    return true;
  }

  async queryStates(query: MemoryQuery): Promise<MemoryState[]> {
    if (this.config.persistToDisk) {
      return await this.storage.queryStates(query);
    }

    // Query from cache only
    const results: MemoryState[] = [];
    
    for (const [projectId, state] of this.cache.entries()) {
      // Apply filters
      if (query.projectId && state.projectId !== query.projectId) continue;
      if (query.userId && state.metadata?.userId !== query.userId) continue;
      if (query.fromDate && state.timestamp < query.fromDate) continue;
      if (query.toDate && state.timestamp > query.toDate) continue;
      if (query.tags && query.tags.length > 0) {
        const stateTags = state.metadata?.tags || [];
        if (!query.tags.some(tag => stateTags.includes(tag))) continue;
      }

      results.push(state);

      // Apply limit
      if (query.limit && results.length >= query.limit) break;
    }

    // Sort by timestamp (most recent first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return results;
  }

  // Specialized methods for different memory types
  async getProjectMemory(projectId: string): Promise<any> {
    const state = await this.getState(`project_${projectId}`);
    return state?.data || null;
  }

  async setProjectMemory(projectId: string, data: any, userId?: string): Promise<void> {
    await this.setState({
      projectId: `project_${projectId}`,
      data,
      timestamp: new Date(),
      version: 0,
      metadata: { userId, tags: ['project'] }
    });
  }

  async getAgentMemory(agentName: string, projectId?: string): Promise<any> {
    const memoryId = projectId ? `agent_${agentName}_${projectId}` : `agent_${agentName}`;
    const state = await this.getState(memoryId);
    return state?.data || null;
  }

  async setAgentMemory(agentName: string, data: any, projectId?: string): Promise<void> {
    const memoryId = projectId ? `agent_${agentName}_${projectId}` : `agent_${agentName}`;
    await this.setState({
      projectId: memoryId,
      data,
      timestamp: new Date(),
      version: 0,
      metadata: { tags: ['agent', agentName] }
    });
  }

  async getUserMemory(userId: string): Promise<any> {
    const state = await this.getState(`user_${userId}`);
    return state?.data || null;
  }

  async setUserMemory(userId: string, data: any): Promise<void> {
    await this.setState({
      projectId: `user_${userId}`,
      data,
      timestamp: new Date(),
      version: 0,
      metadata: { userId, tags: ['user'] }
    });
  }

  // Cache management
  private addToCache(projectId: string, state: MemoryState): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(projectId, state);
    this.stats.cacheSize = this.cache.size;
  }

  clearCache(): void {
    this.cache.clear();
    this.stats.cacheSize = 0;
  }

  // Statistics and monitoring
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.cacheSize = this.cache.size;
    
    if (this.config.persistToDisk) {
      // Update disk usage asynchronously
      this.storage.getStorageStats().then(diskStats => {
        this.stats.diskUsage = diskStats.totalSize;
      }).catch(() => {
        // Ignore errors for stats
      });
    }
  }

  private updateHitRate(hit: boolean): void {
    // Simple hit rate calculation (could be more sophisticated)
    const currentRate = this.stats.hitRate || 0;
    this.stats.hitRate = hit ? 
      Math.min(100, currentRate + 0.1) : 
      Math.max(0, currentRate - 0.1);
  }

  // Cleanup management
  private initializeCleanup(): void {
    if (this.config.autoCleanup) {
      this.cleanupTimer = setInterval(() => {
        this.performCleanup().catch(error => {
          console.error('Memory cleanup error:', error);
        });
      }, this.config.cleanupInterval);
    }
  }

  private async performCleanup(): Promise<void> {
    if (!this.config.persistToDisk) return;

    try {
      // Clean up entries older than 7 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      
      const deletedCount = await this.storage.cleanup(cutoffDate);
      
      console.log(`Memory cleanup completed: ${deletedCount} old entries removed`);
      this.stats.lastCleanup = new Date();
      
    } catch (error) {
      console.error('Memory cleanup failed:', error);
    }
  }

  async forceCleanup(olderThanDays: number = 7): Promise<number> {
    if (!this.config.persistToDisk) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const deletedCount = await this.storage.cleanup(cutoffDate);
    this.stats.lastCleanup = new Date();
    
    return deletedCount;
  }

  // Shutdown and cleanup
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }

  // Export/Import functionality
  async exportMemory(projectId?: string): Promise<MemoryState[]> {
    const query: MemoryQuery = projectId ? { projectId } : {};
    return await this.queryStates(query);
  }

  async importMemory(states: MemoryState[]): Promise<void> {
    for (const state of states) {
      await this.setState(state);
    }
  }

  // Memory optimization
  async optimizeMemory(): Promise<{ before: number; after: number; saved: number }> {
    const beforeSize = this.cache.size;
    
    // Remove duplicate entries (keep latest version)
    const uniqueProjects = new Map<string, MemoryState>();
    
    for (const [projectId, state] of this.cache.entries()) {
      const existing = uniqueProjects.get(projectId);
      if (!existing || state.version > existing.version) {
        uniqueProjects.set(projectId, state);
      }
    }
    
    this.cache.clear();
    for (const [projectId, state] of uniqueProjects.entries()) {
      this.cache.set(projectId, state);
    }
    
    const afterSize = this.cache.size;
    const saved = beforeSize - afterSize;
    
    this.updateStats();
    
    return { before: beforeSize, after: afterSize, saved };
  }
}
