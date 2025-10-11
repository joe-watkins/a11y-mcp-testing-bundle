#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  serversDir: path.join(__dirname, '../servers'),
  servers: [
    {
      name: 'AxeCore MCP Server',
      dir: 'axecore-mcp-server',
      buildCommand: 'npm run build',
      checkFiles: ['build/index.js']
    },
    {
      name: 'ARC Issue Writer MCP',
      dir: 'accessibility-issues-template-mcp', 
      buildCommand: 'npm run build',
      checkFiles: ['dist/index.js']
    },
    {
      name: 'A11y Personas MCP',
      dir: 'a11y-personas-mcp',
      buildCommand: null, // No build needed - uses main.js directly
      checkFiles: ['main.js']
    }
  ]
};

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📦',
    success: '✅', 
    error: '❌',
    warning: '⚠️'
  }[level];
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function executeCommand(command, cwd) {
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    return true;
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    log(`Error: ${error.message}`, 'error');
    return false;
  }
}

function checkServerExists(serverPath) {
  if (!fs.existsSync(serverPath)) {
    log(`Server directory not found: ${serverPath}`, 'error');
    return false;
  }
  return true;
}

function checkPackageJson(serverPath) {
  const packagePath = path.join(serverPath, 'package.json');
  if (!fs.existsSync(packagePath)) {
    log(`package.json not found in ${serverPath}`, 'error');
    return false;
  }
  return true;
}

function installDependencies(serverPath, serverName) {
  log(`Installing dependencies for ${serverName}...`);
  return executeCommand('npm install', serverPath);
}

function buildServer(serverPath, serverName, buildCommand) {
  if (!buildCommand) {
    log(`No build command needed for ${serverName}`, 'info');
    return true;
  }
  
  log(`Building ${serverName}...`);
  return executeCommand(buildCommand, serverPath);
}

function verifyBuildOutput(serverPath, checkFiles, serverName) {
  for (const file of checkFiles) {
    const filePath = path.join(serverPath, file);
    if (!fs.existsSync(filePath)) {
      log(`Build verification failed: ${file} not found for ${serverName}`, 'error');
      return false;
    }
  }
  log(`Build verification passed for ${serverName}`, 'success');
  return true;
}

function buildMCPServer(server) {
  const serverPath = path.join(CONFIG.serversDir, server.dir);
  
  log(`\n🔧 Processing ${server.name}...`);
  
  // Check if server directory exists
  if (!checkServerExists(serverPath)) {
    return false;
  }
  
  // Check if package.json exists
  if (!checkPackageJson(serverPath)) {
    return false;
  }
  
  // Install dependencies
  if (!installDependencies(serverPath, server.name)) {
    return false;
  }
  
  // Build the server
  if (!buildServer(serverPath, server.name, server.buildCommand)) {
    return false;
  }
  
  // Verify build output
  if (!verifyBuildOutput(serverPath, server.checkFiles, server.name)) {
    return false;
  }
  
  log(`${server.name} built successfully!`, 'success');
  return true;
}

function main() {
  log('🚀 Starting MCP Servers Build Process...');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const server of CONFIG.servers) {
    if (buildMCPServer(server)) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  log('\n📊 Build Summary:');
  log(`✅ Successful builds: ${successCount}`);
  log(`❌ Failed builds: ${failureCount}`);
  
  if (failureCount > 0) {
    log('\n⚠️  Some servers failed to build. Please check the errors above.', 'warning');
    log('💡 You may need to restart VS Code to reload the MCP servers after fixing issues.', 'info');
    process.exit(1);
  } else {
    log('\n🎉 All MCP servers built successfully!', 'success');
    log('💡 Restart VS Code to reload the MCP servers with the new builds.', 'info');
  }
}

if (require.main === module) {
  main();
}

module.exports = { buildMCPServer, CONFIG };