#!/usr/bin/env node

/**
 * Start Servers Script - Starts all 3 MCP servers
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message) {
  console.log(`[START] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

async function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const configData = await readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

const runningProcesses = new Map();

function startServer(server) {
  return new Promise((resolve, reject) => {
    log(`Starting ${server.displayName} on port ${server.port}...`);
    
    const [command, ...args] = server.startCommand.split(' ');
    const serverDir = path.resolve(server.directory);
    
    const process = spawn(command, args, {
      cwd: serverDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        PORT: server.port.toString()
      }
    });

    process.stdout.on('data', (data) => {
      console.log(`[${server.name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${server.name}] ${data.toString().trim()}`);
    });

    process.on('error', (err) => {
      error(`Failed to start ${server.displayName}: ${err.message}`);
      reject(err);
    });

    process.on('exit', (code) => {
      if (code !== 0) {
        error(`${server.displayName} exited with code ${code}`);
      }
      runningProcesses.delete(server.name);
    });

    runningProcesses.set(server.name, process);
    
    // Give server time to start
    setTimeout(() => {
      log(`✅ ${server.displayName} started`);
      resolve();
    }, 2000);
  });
}

async function startAllServers() {
  const config = await loadConfig();
  
  log('🚀 Starting all accessibility testing MCP servers...\n');
  
  try {
    // Start servers one by one
    for (const server of config.mcpServers) {
      await startServer(server);
    }
    
    log('\n🎉 All MCP servers are running!');
    log('\n📊 Server Status:');
    config.mcpServers.forEach(server => {
      log(`  ✅ ${server.displayName}: http://localhost:${server.port}`);
    });
    
    log('\n💡 Ready for accessibility testing!');
    log('   Use: /a11y-axe-testing https://example.com');
    log('   Press Ctrl+C to stop all servers');
    
  } catch (err) {
    error('Failed to start servers:');
    error(err.message);
    stopAllServers();
    process.exit(1);
  }
}

function stopAllServers() {
  log('\n🛑 Stopping all servers...');
  
  for (const [name, process] of runningProcesses) {
    try {
      log(`Stopping ${name}...`);
      process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 5000);
      
    } catch (err) {
      error(`Error stopping ${name}: ${err.message}`);
    }
  }
  
  runningProcesses.clear();
  log('All servers stopped');
}

// Handle shutdown signals
process.on('SIGINT', () => {
  console.log('\n');
  stopAllServers();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n');
  stopAllServers();
  process.exit(0);
});

async function main() {
  try {
    await startAllServers();
    
    // Keep process running
    process.stdin.resume();
    
  } catch (err) {
    error('Failed to start servers:');
    error(err.message);
    process.exit(1);
  }
}

main();