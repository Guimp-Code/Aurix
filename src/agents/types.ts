export interface Agent {
  name: string;
  execute: (task: Task) => Promise<Result>;
  validate?: (task: Task) => boolean;
  middleware?: string[];
}

export interface Task {
  type: string;
  config: any;
  metadata?: {
    projectId?: string;
    userId?: string;
    timestamp?: Date;
  };
}

export interface Result {
  success: boolean;
  data: any;
  error?: string;
  metadata?: {
    agent: string;
    executionTime: number;
    timestamp: Date;
  };
}

export interface AgentConfig {
  name: string;
  type: 'architect' | 'dev_builder' | 'dev_ui' | 'llm_architect' | 'qa_tester' | 'packager' | 'manager';
  enabled: boolean;
  settings: Record<string, any>;
}

// Specialized agent interfaces
export interface UITask extends Task {
  type: 'generate_ui' | 'validate_accessibility' | 'optimize_responsive';
  config: {
    template: 'atomic_design' | 'component' | 'page';
    framework?: 'react' | 'vue' | 'angular';
    styling?: 'tailwind' | 'styled-components' | 'css-modules';
    accessibility?: boolean;
    responsive?: boolean;
  };
}

export interface ArchitectTask extends Task {
  type: 'analyze_requirements' | 'design_architecture' | 'create_plan';
  config: {
    requirements: string;
    technology?: string[];
    constraints?: string[];
    timeline?: string;
  };
}

export interface BuildTask extends Task {
  type: 'implement_feature' | 'refactor_code' | 'optimize_performance';
  config: {
    specification: string;
    files?: string[];
    tests?: boolean;
    documentation?: boolean;
  };
}
