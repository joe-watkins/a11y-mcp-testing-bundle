#!/usr/bin/env node

/**
 * Setup Script - Installs all 3 MCP servers
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message) {
  console.log(`[SETUP] ${message}`);
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
  const configData = await readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function setupMCPServers() {
  log('🚀 Setting up accessibility testing MCP servers...\n');
  
  const config = await loadConfig();
  
  // Create servers directory
  const serversDir = path.join(__dirname, '../servers');
  if (!existsSync(serversDir)) {
    mkdirSync(serversDir, { recursive: true });
    log('Created servers directory');
  }

  for (const server of config.mcpServers) {
    log(`\n=== Setting up ${server.displayName} ===`);
    
    const serverPath = path.resolve(server.directory);
    
    // Clone if doesn't exist
    if (!existsSync(serverPath)) {
      log(`Cloning ${server.gitUrl}...`);
      runCommand(`git clone ${server.gitUrl} ${serverPath}`);
    } else {
      log(`${server.displayName} already exists, updating...`);
      runCommand('git pull origin main', serverPath);
    }

    // Install dependencies
    if (server.installCommand) {
      log(`Installing dependencies...`);
      runCommand(server.installCommand, serverPath);
    }

    // Build if needed
    if (server.buildCommand && server.buildCommand.trim() !== '') {
      log(`Building...`);
      runCommand(server.buildCommand, serverPath);
    }

    log(`✅ ${server.displayName} ready`);
  }

  log('\n🎉 All MCP servers installed successfully!');
  log('\n📋 Next Steps:');
  log('1. npm run start        # Start all servers');
  log('2. npm run install-prompt  # Install VS Code system prompt');
  log('3. Use: /a11y-axe-testing https://example.com');
}

async function main() {
  try {
    await setupMCPServers();
  } catch (err) {
    error('Setup failed:');
    error(err.message);
    process.exit(1);
  }
}

main();