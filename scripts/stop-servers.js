#!/usr/bin/env node

/**
 * Stop Servers Script - Stops all running MCP servers
 */

import { execSync } from 'child_process';

function log(message) {
  console.log(`[STOP] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

function stopServersOnPorts() {
  const ports = [3001, 3002, 3003]; // Default MCP server ports
  
  log('🛑 Stopping accessibility testing servers...');
  
  for (const port of ports) {
    try {
      log(`Stopping server on port ${port}...`);
      
      // Find and kill process on port (macOS/Linux)
      const findCmd = `lsof -ti:${port}`;
      
      try {
        const pid = execSync(findCmd, { encoding: 'utf-8' }).trim();
        
        if (pid) {
          execSync(`kill -TERM ${pid}`);
          log(`✅ Stopped server on port ${port} (PID: ${pid})`);
        } else {
          log(`ℹ️  No server running on port ${port}`);
        }
      } catch (err) {
        // No process on this port
        log(`ℹ️  No server running on port ${port}`);
      }
      
    } catch (err) {
      error(`Failed to stop server on port ${port}: ${err.message}`);
    }
  }
  
  log('\n✅ Stop command completed');
  log('💡 Use "npm run start" to start servers again');
}

async function main() {
  try {
    stopServersOnPorts();
  } catch (err) {
    error('Failed to stop servers:');
    error(err.message);
    process.exit(1);
  }
}

main();