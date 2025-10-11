#!/usr/bin/env node

/**
 * Build Servers Script - Installs dependencies and builds all MCP servers
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { readFileSync } = require('fs');
const path = require('path');

function log(message) {
  console.log(`[BUILD] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

function runCommand(command, cwd = process.cwd()) {
  log(`Running: ${command}`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd,
      env: { ...process.env }
    });
  } catch (err) {
    error(`Command failed: ${command}`);
    throw err;
  }
}

async function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const configData = readFileSync(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function buildServers() {
  log('🔨 Building accessibility testing MCP servers...\n');
  
  const config = await loadConfig();
  
  for (const server of config.mcpServers) {
    const serverPath = path.resolve(server.directory);
    
    if (!existsSync(serverPath)) {
      error(`${server.displayName} not found at ${serverPath}`);
      error('Run: npm run setup first to clone repositories');
      process.exit(1);
    }

    log(`\n=== Building ${server.displayName} ===`);

    // Install dependencies
    if (server.installCommand) {
      log('Installing dependencies...');
      runCommand(server.installCommand, serverPath);
    }

    // Build if needed
    if (server.buildCommand && server.buildCommand.trim() !== '') {
      log('Building...');
      runCommand(server.buildCommand, serverPath);
    } else {
      log('No build step required');
    }

    log(`✅ ${server.displayName} ready`);
  }

  log('\n🎉 All MCP servers built successfully!');
  log('\n📋 Next Steps:');
  log('   npm run install-mcp     # Register servers with VS Code');
  log('   npm run install-prompt  # Install system prompt');
}

async function main() {
  try {
    await buildServers();
  } catch (err) {
    error('Build failed:');
    error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { buildServers };