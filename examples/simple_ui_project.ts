import { AurixFramework, applyRule } from '../src/index';
import { UITask, ArchitectTask, BuildTask } from '../src/agents/types';

async function runUIProjectExample() {
  console.log('🚀 Starting Aurix 2.0 UI Project Example');
  console.log('=====================================\n');

  // Initialize Aurix Framework
  const aurix = new AurixFramework({
    memoryConfig: {
      maxCacheSize: 50,
      persistToDisk: true,
      autoCleanup: true
    }
  });

  try {
    // Step 1: Architecture Analysis
    console.log('📐 Step 1: Architecture Analysis');
    const architectTask: ArchitectTask = {
      type: 'analyze_requirements',
      config: {
        requirements: 'Create a responsive dashboard with user management',
        technology: ['React', 'TypeScript', 'Tailwind CSS'],
        constraints: ['Mobile-first', 'WCAG 2.1 AA compliant']
      }
    };

    const architectResult = await aurix.executeTask('architect', architectTask);
    console.log('✅ Architecture:', architectResult.data);
    
    // Store project memory
    await aurix.memory.setProjectMemory('ui_dashboard', {
      architecture: architectResult.data,
      status: 'planned'
    });

    console.log('\n---\n');

    // Step 2: UI Design with Rules
    console.log('🎨 Step 2: UI Design with Frontend Rules');
    
    const uiTask: UITask = {
      type: 'generate_ui',
      config: {
        template: 'atomic_design',
        framework: 'react',
        styling: 'tailwind',
        accessibility: true,
        responsive: true
      }
    };

    // Apply frontend rules
    const ruledUIConfig = await applyRule('frontend', uiTask);
    console.log('📋 Frontend rules applied:', ruledUIConfig.ruleApplied);

    const uiResult = await aurix.executeTask('dev_ui', ruledUIConfig);
    console.log('✅ UI Components:', uiResult.data);

    console.log('\n---\n');

    // Step 3: Code Implementation via Delegation
    console.log('💻 Step 3: Code Implementation via Delegation');

    const buildTask: BuildTask = {
      type: 'implement_feature',
      config: {
        specification: 'Implement dashboard components with TypeScript',
        files: ['Dashboard.tsx', 'UserCard.tsx', 'Navigation.tsx'],
        tests: true,
        documentation: true
      }
    };

    const delegationResult = await aurix.delegateTask('dev_ui', 'dev_builder', buildTask);
    console.log('✅ Implementation:', delegationResult.data);

    console.log('\n---\n');

    // Step 4: Quality Assurance
    console.log('🧪 Step 4: Quality Assurance');

    const qaTask = {
      type: 'validate_quality',
      config: {
        components: delegationResult.data.files,
        tests: delegationResult.data.tests,
        accessibility: true,
        performance: true
      }
    };

    const qaResult = await aurix.executeTask('qa_tester', qaTask);
    console.log('✅ Quality Report:', qaResult.data);

    console.log('\n---\n');

    // Step 5: Task Management Example
    console.log('📝 Step 5: Task Management Example');

    // Add multiple tasks to queue
    const task1 = aurix.addTask({
      type: 'optimize_performance',
      config: { target: 'bundle_size' }
    }, 'dev_builder', 'high');

    const task2 = aurix.addTask({
      type: 'validate_accessibility',
      config: { standard: 'WCAG_2_1_AA' }
    }, 'qa_tester', 'medium');

    const task3 = aurix.addTask({
      type: 'generate_documentation',
      config: { format: 'markdown' }
    }, 'dev_builder', 'low');

    console.log(`📋 Added tasks: ${await task1}, ${await task2}, ${await task3}`);

    // Wait a bit for tasks to process
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n---\n');

    // Step 6: Chain Delegation Example
    console.log('🔗 Step 6: Chain Delegation Example');

    const chainResult = await aurix.delegator.delegateChain([
      {
        agent: 'architect',
        task: {
          type: 'create_plan',
          config: { phase: 'deployment' }
        }
      },
      {
        agent: 'dev_builder',
        task: {
          type: 'implement_feature',
          config: { feature: 'deployment_scripts' }
        }
      },
      {
        agent: 'qa_tester',
        task: {
          type: 'test_deployment',
          config: { environment: 'staging' }
        }
      }
    ]);

    console.log('✅ Chain completed:', chainResult.map(r => r.success));

    console.log('\n---\n');

    // Step 7: Statistics and Memory
    console.log('📊 Step 7: Framework Statistics');

    const stats = aurix.getStats();
    console.log('📈 Execution Stats:', {
      totalExecutions: stats.executor.totalExecutions,
      successRate: `${stats.executor.successRate.toFixed(1)}%`,
      averageTime: `${stats.executor.averageExecutionTime.toFixed(0)}ms`
    });

    console.log('🧠 Memory Stats:', {
      cacheSize: stats.memory.cacheSize,
      hitRate: `${stats.memory.hitRate.toFixed(1)}%`
    });

    console.log('🔄 Delegation Stats:', {
      totalDelegations: stats.delegation.totalDelegations,
      successRate: `${stats.delegation.successRate.toFixed(1)}%`,
      averageTime: `${stats.delegation.averageTime.toFixed(0)}ms`
    });

    console.log('📝 Task Stats:', {
      total: stats.tasks.total,
      completed: stats.tasks.completed,
      successRate: `${stats.tasks.successRate.toFixed(1)}%`
    });

    console.log('\n---\n');

    // Step 8: Project Memory Retrieval
    console.log('💾 Step 8: Project Memory Retrieval');

    const projectMemory = await aurix.memory.getProjectMemory('ui_dashboard');
    console.log('🗄️ Stored project data:', projectMemory);

    console.log('\n=====================================');
    console.log('🎉 Aurix 2.0 Example Completed Successfully!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Example failed:', error);
  } finally {
    // Cleanup
    await aurix.shutdown();
  }
}

// Run the example
if (require.main === module) {
  runUIProjectExample().catch(console.error);
}

export default runUIProjectExample;
