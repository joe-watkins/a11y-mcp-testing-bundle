#!/usr/bin/env node

/**
 * Install MCP Servers Script - Registers MCP servers with VS Code
 */

const { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } = require('fs');
const path = require('path');
const os = require('os');

function log(message) {
  console.log(`[MCP] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

async function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const configData = readFileSync(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function installMCPServers() {
  log('📝 Installing MCP servers to VS Code configuration...\n');
  
  const config = await loadConfig();
  const mcpConfigPath = path.join(os.homedir(), 'Library/Application Support/Code/User/mcp.json');
  const bundleDir = path.resolve(__dirname, '..');

  // Define the MCP server entries for this bundle
  const newServers = {
    "A11y Personas MCP": {
      "type": "stdio",
      "command": "node",
      "args": [
        path.join(bundleDir, "servers/a11y-personas-mcp/main.js")
      ]
    },
    "AxeCore MCP": {
      "type": "stdio",
      "command": "node",
      "args": [
        path.join(bundleDir, "servers/axecore-mcp-server/build/index.js")
      ]
    },
    "ARC Issue Writer MCP": {
      "type": "stdio",
      "command": "node",
      "args": [
        path.join(bundleDir, "servers/accessibility-issues-template-mcp/dist/index.js")
      ]
    }
  };

  try {
    // Read existing mcp.json or create new structure
    let mcpConfig = {
      "inputs": [],
      "servers": {}
    };

    if (existsSync(mcpConfigPath)) {
      log('Reading existing VS Code MCP configuration...');
      try {
        mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf8'));
      } catch (parseErr) {
        log('⚠️  Invalid JSON in mcp.json, creating backup and fresh config...');
        
        // Backup the malformed file
        const backupPath = mcpConfigPath + '.backup.' + Date.now();
        copyFileSync(mcpConfigPath, backupPath);
        log(`   Backed up malformed file to: ${backupPath}`);
        
        // Start with fresh config
        mcpConfig = { "inputs": [], "servers": {} };
      }
    } else {
      log('Creating new VS Code MCP configuration...');
      // Create the directory if it doesn't exist
      const configDir = path.dirname(mcpConfigPath);
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }
    }

    // Ensure servers section exists
    if (!mcpConfig.servers) {
      mcpConfig.servers = {};
    }

    // Check if our servers are already configured
    const existingServerNames = Object.keys(mcpConfig.servers);
    const ourServerNames = Object.keys(newServers);
    const alreadyConfigured = ourServerNames.filter(name => existingServerNames.includes(name));

    if (alreadyConfigured.length > 0) {
      log(`Updating existing a11y servers: ${alreadyConfigured.join(', ')}`);
    }

    const newServerNames = ourServerNames.filter(name => !existingServerNames.includes(name));
    if (newServerNames.length > 0) {
      log(`Adding new a11y servers: ${newServerNames.join(', ')}`);
    }

    log(`Preserving existing servers: ${existingServerNames.filter(name => !ourServerNames.includes(name)).join(', ') || 'none'}`);

    // Merge our servers with existing ones (this preserves existing servers)
    mcpConfig.servers = { ...mcpConfig.servers, ...newServers };

    // Write back to mcp.json with proper formatting
    writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, '\t'));

    log('✅ MCP servers registered with VS Code');
    log(`📍 Configuration updated: ${mcpConfigPath}`);
    log('');
    log('📋 Registered servers:');
    ourServerNames.forEach(name => {
      log(`   • ${name}`);
    });
    log('');
    log('🔄 Please restart VS Code to activate the MCP servers');

  } catch (err) {
    error(`Failed to install MCP servers: ${err.message}`);
    log('');
    log('🛠️  Manual installation required:');
    log('   1. Open VS Code');
    log(`   2. Edit: ${mcpConfigPath}`);
    log('   3. Add the following to the "servers" section:');
    log('');
    log(JSON.stringify(newServers, null, 2));
    process.exit(1);
  }
}

async function main() {
  try {
    await installMCPServers();
  } catch (err) {
    error('Installation failed:');
    error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { installMCPServers };