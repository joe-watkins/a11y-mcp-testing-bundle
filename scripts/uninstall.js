#!/usr/bin/env node

/**
 * Uninstall Script - Removes MCP servers and system prompt from VS Code
 */

const { existsSync, readFileSync, writeFileSync, unlinkSync, rmSync } = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

function log(message) {
  console.log(`[UNINSTALL] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function removeMCPServers() {
  const mcpConfigPath = path.join(os.homedir(), 'Library/Application Support/Code/User/mcp.json');
  
  if (!existsSync(mcpConfigPath)) {
    log('No VS Code MCP configuration found');
    return;
  }

  log('🗑️  Removing MCP servers from VS Code configuration...');
  
  try {
    const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf8'));
    
    const serversToRemove = [
      'Accessibility Personas - MCP',
      'AxeCore - MCP', 
      'ARC Issues Writer - MCP'
    ];
    
    let removedCount = 0;
    
    if (mcpConfig.servers) {
      serversToRemove.forEach(serverName => {
        if (mcpConfig.servers[serverName]) {
          delete mcpConfig.servers[serverName];
          removedCount++;
          log(`   ✅ Removed: ${serverName}`);
        }
      });
    }
    
    if (removedCount > 0) {
      // Write back with proper formatting
      writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, '\t'));
      log(`✅ Removed ${removedCount} MCP server(s) from VS Code`);
    } else {
      log('No a11y testing MCP servers were configured');
    }
    
  } catch (err) {
    error(`Failed to update mcp.json: ${err.message}`);
  }
}

async function removeSystemPrompt() {
  const promptPath = path.join(os.homedir(), 'Library/Application Support/Code/User/prompts/a11y-axe-testing.prompt.md');
  
  if (existsSync(promptPath)) {
    log('🗑️  Removing system prompt...');
    try {
      unlinkSync(promptPath);
      log('✅ System prompt removed');
    } catch (err) {
      error(`Failed to remove system prompt: ${err.message}`);
    }
  } else {
    log('No system prompt found to remove');
  }
}

async function removeServerFiles() {
  const serversDir = path.join(__dirname, '../servers');
  
  if (existsSync(serversDir)) {
    log('🗑️  Removing cloned MCP server files...');
    try {
      rmSync(serversDir, { recursive: true, force: true });
      log('✅ MCP server files removed');
    } catch (err) {
      error(`Failed to remove server files: ${err.message}`);
    }
  } else {
    log('No server files found to remove');
  }
}

async function uninstall() {
  log('🗑️  Uninstalling a11y testing bundle...\n');
  
  log('This will remove:');
  log('   • MCP servers from VS Code configuration');
  log('   • System prompt from VS Code');
  log('   • Cloned MCP server files');
  log('');
  
  const answer = await prompt('Are you sure you want to continue? (y/N): ');
  
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    log('❌ Uninstall cancelled');
    return;
  }
  
  log('');
  
  // Remove MCP servers from VS Code
  await removeMCPServers();
  
  log('');
  
  // Remove system prompt
  await removeSystemPrompt();
  
  log('');
  
  // Remove server files
  await removeServerFiles();
  
  log('');
  log('='.repeat(60));
  log('🎉 Uninstall complete!');
  log('');
  log('📋 What was removed:');
  log('   ✅ MCP servers unregistered from VS Code');
  log('   ✅ System prompt removed');
  log('   ✅ Local server files cleaned up');
  log('');
  log('💡 To reinstall:');
  log('   npm run install-all');
  log('');
  log('⚠️  Note: Restart VS Code to complete the removal');
}

async function main() {
  try {
    await uninstall();
  } catch (err) {
    error('Uninstall failed:');
    error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { uninstall };