#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToRemove = [
  // Redundant build scripts
  'scripts/build-servers.js',
  'scripts/check-and-build.js',
  
  // Redundant documentation
  'BUILD_PROCESS.md',
  
  // Unnecessary MCP server lifecycle scripts (VS Code handles this)
  'scripts/start-servers.js',
  'scripts/stop-servers.js'
];

function log(message, level = 'info') {
  const prefix = {
    info: '📦',
    success: '✅', 
    error: '❌',
    warning: '⚠️'
  }[level];
  
  console.log(`${prefix} ${message}`);
}

function removeFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      log(`Removed: ${filePath}`, 'success');
      return true;
    } catch (error) {
      log(`Failed to remove ${filePath}: ${error.message}`, 'error');
      return false;
    }
  } else {
    log(`File not found (already clean): ${filePath}`, 'info');
    return true;
  }
}

function main() {
  log('🧹 Cleaning up redundant files...\n');
  
  let removedCount = 0;
  let totalFiles = filesToRemove.length;
  
  for (const file of filesToRemove) {
    if (removeFile(file)) {
      removedCount++;
    }
  }
  
  log(`\n📊 Cleanup Summary:`);
  log(`✅ Files processed: ${removedCount}/${totalFiles}`);
  log(`🗑️  Project is now cleaner and more focused!`);
  
  log('\n📁 Core files remaining:');
  log('  • scripts/install-all.js - Complete installation');
  log('  • scripts/build-mcp-servers.js - MCP server building'); 
  log('  • scripts/clone-repos.js - Repository management');
  log('  • scripts/install-mcp-servers.js - VS Code integration');
  log('  • scripts/install-prompt.js - Prompt installation');
  log('  • scripts/health-check.js - System verification');
  log('  • scripts/update.js - Update workflow');
  log('  • scripts/uninstall.js - Clean removal');
}

if (require.main === module) {
  main();
}

module.exports = { filesToRemove };