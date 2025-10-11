#!/usr/bin/env node

/**
 * Health Check Script - Checks if all MCP servers are running
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

function log(message) {
  console.log(`[HEALTH] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

async function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const configData = await readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function checkServer(server) {
  try {
    log(`Checking ${server.displayName}...`);
    
    // Simple port check - try to connect
    const response = await fetch(`http://localhost:${server.port}/`, { 
      signal: AbortSignal.timeout(5000) 
    });
    
    log(`✅ ${server.displayName} is running (port ${server.port})`);
    return true;
    
  } catch (err) {
    if (err.name === 'TimeoutError') {
      error(`❌ ${server.displayName} timed out (port ${server.port})`);
    } else if (err.cause?.code === 'ECONNREFUSED') {
      error(`❌ ${server.displayName} is not running (port ${server.port})`);
    } else {
      error(`❌ ${server.displayName} health check failed: ${err.message}`);
    }
    return false;
  }
}

async function healthCheck() {
  log('🔍 Checking accessibility testing MCP servers...\n');
  
  const config = await loadConfig();
  const results = [];
  
  // Check each server
  for (const server of config.mcpServers) {
    const healthy = await checkServer(server);
    results.push({ server: server.displayName, healthy });
  }
  
  // Summary
  log('\n📊 Health Check Results:');
  log('========================');
  
  const healthy = results.filter(r => r.healthy);
  const unhealthy = results.filter(r => !r.healthy);
  
  healthy.forEach(r => log(`✅ ${r.server}`));
  unhealthy.forEach(r => log(`❌ ${r.server}`));
  
  log(`\n📈 Status: ${unhealthy.length === 0 ? '🟢 All systems healthy' : `🔴 ${unhealthy.length} system(s) down`}`);
  
  if (unhealthy.length > 0) {
    log('\n🔧 Troubleshooting:');
    log('1. npm run start     # Start all servers');
    log('2. npm run setup     # Reinstall if needed');
    log('3. Check the logs above for specific errors');
  } else {
    log('\n🎉 All systems ready for accessibility testing!');
    log('💡 Try: /a11y-axe-testing https://example.com');
  }
  
  return unhealthy.length === 0;
}

async function main() {
  try {
    const allHealthy = await healthCheck();
    process.exit(allHealthy ? 0 : 1);
  } catch (err) {
    error('Health check failed:');
    error(err.message);
    process.exit(1);
  }
}

main();