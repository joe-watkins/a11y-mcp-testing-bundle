#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📦',
    success: '✅', 
    error: '❌',
    warning: '⚠️'
  }[level];
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function executeScript(scriptPath, description) {
  try {
    log(`Running ${description}...`);
    execSync(`node ${scriptPath}`, { 
      stdio: 'inherit',
      cwd: __dirname
    });
    log(`${description} completed successfully`, 'success');
    return true;
  } catch (error) {
    log(`${description} failed: ${error.message}`, 'error');
    return false;
  }
}

function main() {
  log('🚀 Starting Complete A11y Testing Bundle Installation...\n');
  log('This will install everything needed for accessibility testing workflows.');
  log(''); 
  
  const installSteps = [
    {
      script: './clone-repos.js',
      description: 'Step 1: Cloning MCP Server Repositories'
    },
    {
      script: './install-mcp-servers.js', 
      description: 'Step 2: Installing MCP Server Dependencies'
    },
    {
      script: './build-mcp-servers.js',
      description: 'Step 3: Building MCP Servers (TypeScript Compilation)'
    },
    {
      script: './install-mcp-servers.js',
      description: 'Step 4: Registering MCP Servers with VS Code'
    },
    {
      script: './install-prompt.js',
      description: 'Step 5: Installing System Prompt'
    },
    {
      script: './health-check.js',
      description: 'Step 6: Running Health Check'
    }
  ];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const step of installSteps) {
    log(`\n${step.description}...`);
    if (executeScript(step.script, step.description)) {
      successCount++;
    } else {
      failureCount++;
      log(`\n❌ Installation stopped due to failure in: ${step.description}`, 'error');
      log('💡 Try running individual steps to debug:', 'info');
      log(`   node scripts/${path.basename(step.script)}`, 'info');
      process.exit(1);
    }
  }
  
  log('\n🎉 INSTALLATION COMPLETE! 🎉', 'success');
  log(''); 
  log('📊 Installation Summary:');
  log(`✅ Completed steps: ${successCount}/${installSteps.length}`);
  log('');
  log('🔧 What was installed:');
  log('   • AxeCore MCP Server (Web accessibility scanning)');
  log('   • ARC Issues Writer MCP (Issue template generation)');
  log('   • A11y Personas MCP (User impact analysis)');
  log('   • System prompt for coordinated testing workflows');
  log('');
  log('🚀 Next Steps:');
  log('   1. 🔄 RESTART VS CODE (Required for MCP servers to load)');
  log('   2. ✨ Test the workflow: /a11y-axe-testing https://example.com');
  log('   3. 📊 Check status anytime: npm run status');
  log('');
  log('💡 Ready to make the web more accessible!');
}

if (require.main === module) {
  main();
}