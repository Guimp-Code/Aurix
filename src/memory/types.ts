export interface MemoryState {
  projectId: string;
  data: any;
  timestamp: Date;
  version: number;
  metadata?: {
    userId?: string;
    sessionId?: string;
    tags?: string[];
  };
}

export interface MemoryConfig {
  maxCacheSize: number;
  persistToDisk: boolean;
  autoCleanup: boolean;
  cleanupInterval: number; // in milliseconds
  compressionEnabled: boolean;
}

export interface MemoryStats {
  totalEntries: number;
  cacheSize: number;
  diskUsage: number;
  hitRate: number;
  lastCleanup: Date;
}

export interface MemoryQuery {
  projectId?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

export interface MemoryEntry {
  id: string;
  projectId: string;
  data: any;
  timestamp: Date;
  version: number;
  metadata: {
    userId?: string;
    sessionId?: string;
    tags?: string[];
    size: number;
    compressed: boolean;
  };
}

// Specialized memory types
export interface ProjectMemory extends MemoryState {
  data: {
    architecture?: any;
    components?: any[];
    dependencies?: string[];
    configuration?: Record<string, any>;
    history?: Array<{
      action: string;
      timestamp: Date;
      agent: string;
      details: any;
    }>;
  };
}

export interface AgentMemory extends MemoryState {
  data: {
    agentName: string;
    executionHistory: Array<{
      taskType: string;
      result: any;
      executionTime: number;
      timestamp: Date;
    }>;
    preferences: Record<string, any>;
    learnings: Array<{
      pattern: string;
      solution: string;
      confidence: number;
      timestamp: Date;
    }>;
  };
}

export interface UserMemory extends MemoryState {
  data: {
    userId: string;
    preferences: Record<string, any>;
    projects: string[];
    sessions: Array<{
      sessionId: string;
      startTime: Date;
      endTime?: Date;
      actions: number;
    }>;
    analytics: {
      totalSessions: number;
      totalActions: number;
      favoriteAgents: string[];
      avgSessionTime: number;
    };
  };
}
