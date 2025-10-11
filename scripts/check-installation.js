#!/usr/bin/env node

/**
 * Check Installation Script - Verifies complete installation
 */

const { readFileSync, existsSync } = require('fs');
const path = require('path');
const os = require('os');

function log(message) {
  console.log(`[CHECK] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

async function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const configData = readFileSync(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function checkInstallation() {
  log('🔍 Checking a11y testing bundle installation...\n');

  const bundleDir = path.resolve(__dirname, '..');
  const mcpConfigPath = path.join(os.homedir(), 'Library/Application Support/Code/User/mcp.json');
  const promptPath = path.join(os.homedir(), 'Library/Application Support/Code/User/prompts/a11y-axe-testing.prompt.md');

  let allGood = true;
  let issues = [];

  // Check if MCP servers are cloned and built
  const serverChecks = [
    { path: 'servers/a11y-personas-mcp/main.js', name: 'Accessibility Personas MCP' },
    { path: 'servers/axecore-mcp-server/build/index.js', name: 'AxeCore MCP' },
    { path: 'servers/accessibility-issues-template-mcp/dist/index.js', name: 'ARC Issues Writer MCP' }
  ];

  log('📁 MCP Server Files:');
  serverChecks.forEach(check => {
    const fullPath = path.join(bundleDir, check.path);
    const exists = existsSync(fullPath);
    log(`   ${exists ? '✅' : '❌'} ${check.name}`);
    if (!exists) {
      allGood = false;
      issues.push(`Missing: ${check.path}`);
    }
  });

  log('\n🔧 VS Code MCP Configuration:');
  
  // Check mcp.json
  if (existsSync(mcpConfigPath)) {
    try {
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf8'));
      const serverChecks = [
        { key: 'Accessibility Personas - MCP', name: 'Accessibility Personas MCP' },
        { key: 'AxeCore - MCP', name: 'AxeCore MCP' },
        { key: 'ARC Issues Writer - MCP', name: 'ARC Issues Writer MCP' }
      ];

      serverChecks.forEach(check => {
        const configured = !!(mcpConfig.servers && mcpConfig.servers[check.key]);
        log(`   ${configured ? '✅' : '❌'} ${check.name}`);
        if (!configured) {
          allGood = false;
          issues.push(`MCP server not configured: ${check.name}`);
        }
      });

    } catch (err) {
      log('   ❌ Error reading mcp.json');
      allGood = false;
      issues.push('Cannot read VS Code MCP configuration');
    }
  } else {
    log('   ❌ mcp.json not found');
    allGood = false;
    issues.push('VS Code MCP configuration file missing');
  }

  // Check system prompt
  log('\n💬 System Prompt:');
  const promptExists = existsSync(promptPath);
  log(`   ${promptExists ? '✅' : '❌'} a11y-axe-testing.prompt.md`);
  if (!promptExists) {
    allGood = false;
    issues.push('System prompt not installed');
  }

  log('\n' + '='.repeat(60));
  
  if (allGood) {
    log('🎉 Installation Complete and Verified!');
    log('');
    log('📋 Ready to use:');
    log('   1. Restart VS Code if you haven\'t already');
    log('   2. In VS Code Copilot, use: /a11y-axe-testing https://example.com');
    log('   3. The system will automatically coordinate all 3 MCP servers');
    log('');
    log('✨ Happy accessibility testing!');
    return true;
  } else {
    log('⚠️  Installation Issues Found');
    log('');
    log('🚨 Issues detected:');
    issues.forEach(issue => log(`   • ${issue}`));
    log('');
    log('🛠️  Recommended fixes:');
    
    if (issues.some(i => i.includes('Missing:'))) {
      log('   npm run setup       # Clone and build MCP servers');
    }
    if (issues.some(i => i.includes('MCP server not configured'))) {
      log('   npm run install-mcp # Register servers with VS Code');
    }
    if (issues.some(i => i.includes('System prompt'))) {
      log('   npm run install-prompt # Install system prompt');
    }
    log('');
    log('   Or run: npm run install-all  # Complete installation');
    
    return false;
  }
}

async function main() {
  try {
    const success = await checkInstallation();
    process.exit(success ? 0 : 1);
  } catch (err) {
    error('Status check failed:');
    error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkInstallation };