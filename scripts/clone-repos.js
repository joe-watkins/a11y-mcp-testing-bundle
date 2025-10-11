#!/usr/bin/env node

/**
 * Clone Repos Script - Clones all 3 MCP server repositories
 */

const { execSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');
const { readFileSync } = require('fs');
const path = require('path');

function log(message) {
  console.log(`[CLONE] ${message}`);
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

async function cloneRepositories() {
  log('📥 Cloning accessibility testing MCP server repositories...\n');
  
  const config = await loadConfig();
  
  // Create servers directory
  const serversDir = path.join(__dirname, '../servers');
  if (!existsSync(serversDir)) {
    mkdirSync(serversDir, { recursive: true });
    log('Created servers directory');
  }

  for (const server of config.mcpServers) {
    log(`\n=== Cloning ${server.displayName} ===`);
    
    const serverPath = path.resolve(server.directory);
    
    // Clone if doesn't exist
    if (!existsSync(serverPath)) {
      log(`Cloning from ${server.gitUrl}...`);
      runCommand(`git clone ${server.gitUrl} ${serverPath}`);
      log(`✅ ${server.displayName} cloned successfully`);
    } else {
      log(`${server.displayName} already exists, updating...`);
      runCommand('git pull origin main', serverPath);
      log(`✅ ${server.displayName} updated`);
    }
  }

  log('\n🎉 All repositories cloned/updated successfully!');
}

async function main() {
  try {
    await cloneRepositories();
  } catch (err) {
    error('Clone operation failed:');
    error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { cloneRepositories };