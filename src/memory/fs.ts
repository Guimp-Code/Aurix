import * as fs from 'fs-extra';
import * as path from 'path';
import { MemoryState, MemoryEntry, MemoryQuery } from './types';

export class FileSystemStorage {
  private basePath: string;
  private compressionEnabled: boolean;

  constructor(basePath: string = './aurix_memory', compressionEnabled: boolean = true) {
    this.basePath = basePath;
    this.compressionEnabled = compressionEnabled;
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    await fs.ensureDir(this.basePath);
    await fs.ensureDir(path.join(this.basePath, 'projects'));
    await fs.ensureDir(path.join(this.basePath, 'agents'));
    await fs.ensureDir(path.join(this.basePath, 'users'));
    await fs.ensureDir(path.join(this.basePath, 'sessions'));
    await fs.ensureDir(path.join(this.basePath, 'backups'));
  }

  async saveState(state: MemoryState): Promise<void> {
    // Ensure directories exist first
    await this.ensureDirectoryExists();
    
    const filePath = this.getFilePath(state.projectId);
    
    const entry: MemoryEntry = {
      id: this.generateId(state.projectId),
      projectId: state.projectId,
      data: state.data,
      timestamp: state.timestamp,
      version: state.version,
      metadata: {
        ...state.metadata,
        size: JSON.stringify(state.data).length,
        compressed: this.compressionEnabled
      }
    };

    try {
      // Compress data if enabled
      let dataToSave = entry;
      if (this.compressionEnabled) {
        dataToSave = this.compressEntry(entry);
      }

      await fs.writeJson(filePath, dataToSave, { spaces: 2 });
      
      // Also save to backup with timestamp
      const backupPath = this.getBackupPath(state.projectId, state.timestamp);
      await fs.writeJson(backupPath, dataToSave, { spaces: 2 });
      
    } catch (error) {
      throw new Error(`Failed to save memory state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async loadState(projectId: string): Promise<MemoryState | null> {
    const filePath = this.getFilePath(projectId);
    
    try {
      if (!(await fs.pathExists(filePath))) {
        return null;
      }

      let entry: MemoryEntry = await fs.readJson(filePath);
      
      // Decompress if needed
      if (entry.metadata?.compressed) {
        entry = this.decompressEntry(entry);
      }

      return {
        projectId: entry.projectId,
        data: entry.data,
        timestamp: new Date(entry.timestamp),
        version: entry.version,
        metadata: entry.metadata
      };
    } catch (error) {
      throw new Error(`Failed to load memory state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteState(projectId: string): Promise<boolean> {
    const filePath = this.getFilePath(projectId);
    
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        
        // Also remove backups
        const backupDir = path.join(this.basePath, 'backups', projectId);
        if (await fs.pathExists(backupDir)) {
          await fs.remove(backupDir);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Failed to delete memory state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async queryStates(query: MemoryQuery): Promise<MemoryState[]> {
    const results: MemoryState[] = [];
    
    try {
      const projectsDir = path.join(this.basePath, 'projects');
      const files = await fs.readdir(projectsDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(projectsDir, file);
        const entry: MemoryEntry = await fs.readJson(filePath);
        
        // Apply filters
        if (query.projectId && entry.projectId !== query.projectId) continue;
        if (query.userId && entry.metadata?.userId !== query.userId) continue;
        if (query.fromDate && new Date(entry.timestamp) < query.fromDate) continue;
        if (query.toDate && new Date(entry.timestamp) > query.toDate) continue;
        if (query.tags && query.tags.length > 0) {
          const entryTags = entry.metadata?.tags || [];
          if (!query.tags.some(tag => entryTags.includes(tag))) continue;
        }

        // Decompress if needed
        let decompressedEntry = entry;
        if (entry.metadata?.compressed) {
          decompressedEntry = this.decompressEntry(entry);
        }

        results.push({
          projectId: decompressedEntry.projectId,
          data: decompressedEntry.data,
          timestamp: new Date(decompressedEntry.timestamp),
          version: decompressedEntry.version,
          metadata: decompressedEntry.metadata
        });

        // Apply limit
        if (query.limit && results.length >= query.limit) break;
      }
      
      // Sort by timestamp (most recent first)
      results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      return results;
    } catch (error) {
      throw new Error(`Failed to query memory states: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number; oldestEntry: Date; newestEntry: Date }> {
    try {
      const projectsDir = path.join(this.basePath, 'projects');
      const files = await fs.readdir(projectsDir);
      
      let totalSize = 0;
      let oldestEntry = new Date();
      let newestEntry = new Date(0);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(projectsDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        
        const entry: MemoryEntry = await fs.readJson(filePath);
        const entryDate = new Date(entry.timestamp);
        
        if (entryDate < oldestEntry) oldestEntry = entryDate;
        if (entryDate > newestEntry) newestEntry = entryDate;
      }
      
      return {
        totalFiles: files.filter((f: string) => f.endsWith('.json')).length,
        totalSize,
        oldestEntry,
        newestEntry
      };
    } catch (error) {
      throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async cleanup(olderThan: Date): Promise<number> {
    let deletedCount = 0;
    
    try {
      const projectsDir = path.join(this.basePath, 'projects');
      const files = await fs.readdir(projectsDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(projectsDir, file);
        const entry: MemoryEntry = await fs.readJson(filePath);
        
        if (new Date(entry.timestamp) < olderThan) {
          await fs.remove(filePath);
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup old entries: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getFilePath(projectId: string): string {
    return path.join(this.basePath, 'projects', `${projectId}.json`);
  }

  private getBackupPath(projectId: string, timestamp: Date): string {
    const backupDir = path.join(this.basePath, 'backups', projectId);
    fs.ensureDirSync(backupDir);
    const timestampStr = timestamp.toISOString().replace(/[:.]/g, '-');
    return path.join(backupDir, `${timestampStr}.json`);
  }

  private generateId(projectId: string): string {
    return `${projectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private compressEntry(entry: MemoryEntry): MemoryEntry {
    // Simple compression simulation (in real implementation, use zlib)
    const compressed = {
      ...entry,
      data: JSON.stringify(entry.data), // In real implementation, compress this
      metadata: {
        ...entry.metadata,
        compressed: true,
        originalSize: entry.metadata.size
      }
    };
    return compressed;
  }

  private decompressEntry(entry: MemoryEntry): MemoryEntry {
    // Simple decompression simulation
    const decompressed = {
      ...entry,
      data: typeof entry.data === 'string' ? JSON.parse(entry.data) : entry.data,
      metadata: {
        ...entry.metadata,
        compressed: false
      }
    };
    return decompressed;
  }
}
