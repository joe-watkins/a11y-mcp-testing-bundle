#!/usr/bin/env node

/**
 * Update Script - Updates all MCP servers to latest versions
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message) {
  console.log(`[UPDATE] ${message}`);
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

async function updateServer(server) {
  const serverPath = path.resolve(server.directory);
  
  if (!existsSync(serverPath)) {
    error(`${server.displayName} not found at ${serverPath}`);
    log('Run: npm run setup first');
    return false;
  }

  log(`\n=== Updating ${server.displayName} ===`);
  
  try {
    // Pull latest changes
    log('Pulling latest changes...');
    runCommand('git pull origin main', serverPath);
    
    // Reinstall dependencies
    if (server.installCommand) {
      log('Updating dependencies...');
      runCommand(server.installCommand, serverPath);
    }
    
    // Rebuild if needed
    if (server.buildCommand && server.buildCommand.trim() !== '') {
      log('Rebuilding...');
      runCommand(server.buildCommand, serverPath);
    }
    
    log(`✅ ${server.displayName} updated`);
    return true;
    
  } catch (err) {
    error(`Failed to update ${server.displayName}: ${err.message}`);
    return false;
  }
}

async function updateAllServers() {
  log('🔄 Updating all accessibility testing MCP servers...');
  
  const config = await loadConfig();
  const results = [];
  
  for (const server of config.mcpServers) {
    const success = await updateServer(server);
    results.push({ server: server.displayName, success });
  }
  
  // Summary
  log('\n📊 Update Results:');
  log('==================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  successful.forEach(r => log(`✅ ${r.server}`));
  failed.forEach(r => log(`❌ ${r.server}`));
  
  if (failed.length === 0) {
    log('\n🎉 All servers updated successfully!');
    log('\n📋 Next Steps:');
    log('1. npm run stop      # Stop old versions');
    log('2. npm run start     # Start updated versions');
    log('3. npm run status    # Verify everything works');
  } else {
    log(`\n⚠️  ${failed.length} server(s) failed to update`);
    log('Check error messages above and fix manually');
  }
  
  return failed.length === 0;
}

async function main() {
  try {
    const success = await updateAllServers();
    process.exit(success ? 0 : 1);
  } catch (err) {
    error('Update failed:');
    error(err.message);
    process.exit(1);
  }
}

main();