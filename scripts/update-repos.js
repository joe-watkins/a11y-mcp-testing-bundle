#!/usr/bin/env node

/**
 * Update Repositories Script - Updates existing MCP server repositories
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const path = require('path');

function log(message) {
  console.log(`[UPDATE] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

function execCommand(command, cwd) {
  log(`Running: ${command}`);
  return execSync(command, { 
    cwd, 
    stdio: 'inherit',
    encoding: 'utf8'
  });
}

async function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const configData = readFileSync(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function updateRepositories() {
  log('🔄 Updating MCP server repositories...\n');
  
  const config = await loadConfig();
  const serversDir = path.join(__dirname, '../servers');
  
  if (!existsSync(serversDir)) {
    error('Servers directory not found. Run "npm run setup" first.');
    process.exit(1);
  }

  for (const [serverName, serverConfig] of Object.entries(config.servers)) {
    const serverPath = path.join(serversDir, serverName);
    
    if (!existsSync(serverPath)) {
      log(`⚠️  ${serverName} not found, skipping...`);
      continue;
    }

    log(`📥 Updating ${serverName}...`);
    
    try {
      // Fetch latest changes
      execCommand('git fetch origin', serverPath);
      
      // Check if we're behind
      try {
        const behind = execSync('git rev-list HEAD..origin/main --count', { 
          cwd: serverPath, 
          encoding: 'utf8' 
        }).trim();
        
        if (behind === '0') {
          log(`   ✅ ${serverName} is already up to date`);
        } else {
          log(`   📦 ${serverName} has ${behind} new commits, updating...`);
          
          // Pull latest changes
          execCommand('git pull origin main', serverPath);
          
          // Install dependencies if needed
          if (existsSync(path.join(serverPath, 'package.json'))) {
            log(`   📦 Installing dependencies for ${serverName}...`);
            execCommand('npm install', serverPath);
          }
          
          // Run build if specified
          if (serverConfig.buildCommand) {
            log(`   🔨 Building ${serverName}...`);
            execCommand(serverConfig.buildCommand, serverPath);
          }
          
          log(`   ✅ ${serverName} updated successfully`);
        }
      } catch (revErr) {
        // If we can't check commits, just try to pull
        log(`   🔄 Attempting to pull latest changes for ${serverName}...`);
        execCommand('git pull origin main', serverPath);
        
        if (existsSync(path.join(serverPath, 'package.json'))) {
          execCommand('npm install', serverPath);
        }
        
        if (serverConfig.buildCommand) {
          execCommand(serverConfig.buildCommand, serverPath);
        }
        
        log(`   ✅ ${serverName} updated`);
      }
      
    } catch (err) {
      error(`Failed to update ${serverName}: ${err.message}`);
      log(`   ⚠️  Continuing with other servers...`);
    }
    
    log('');
  }

  log('🎉 Repository updates complete!\n');
  log('💡 Next steps:');
  log('   • Restart VS Code to use updated servers');
  log('   • Run "npm run status" to verify everything is working');
}

async function main() {
  try {
    await updateRepositories();
  } catch (err) {
    error('Update failed:');
    error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateRepositories };