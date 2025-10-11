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

function executeCommand(command, description) {
  try {
    log(`Running: ${description}...`);
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    log(`${description} completed successfully`, 'success');
    return true;
  } catch (error) {
    log(`${description} failed: ${error.message}`, 'error');
    return false;
  }
}

function main() {
  log('🔧 Starting MCP Server Health Check...\n');
  
  const checks = [
    {
      command: 'node scripts/build-mcp-servers.js',
      description: 'Building MCP Servers'
    },
    {
      command: 'node scripts/health-check.js',
      description: 'Running Health Check'
    }
  ];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const check of checks) {
    if (executeCommand(check.command, check.description)) {
      successCount++;
    } else {
      failureCount++;
    }
    log(''); // Add spacing
  }
  
  log('\n📊 Health Check Summary:');
  log(`✅ Passed checks: ${successCount}/${checks.length}`);
  log(`❌ Failed checks: ${failureCount}`);
  
  if (failureCount > 0) {
    log('\n⚠️  Some checks failed. Please review the errors above.', 'warning');
    process.exit(1);
  } else {
    log('\n🎉 All systems operational!', 'success');
    log('💡 Ready for accessibility testing!', 'info');
  }
}

if (require.main === module) {
  main();
}