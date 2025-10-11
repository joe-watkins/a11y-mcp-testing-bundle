#!/usr/bin/env node

/**
 * Install Prompt Script - Copies system prompt to VS Code
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message) {
  console.log(`[PROMPT] ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${message}`);
}

async function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const configData = await readFile(configPath, 'utf-8');
  return JSON.parse(configData);
}

async function installSystemPrompt() {
  log('📝 Installing accessibility testing system prompt...');
  
  const config = await loadConfig();
  
  // Resolve VS Code prompts path
  const vscodePromptsPath = config.systemPrompt.vscodePromptsPath.replace('~', homedir());
  
  // Create prompts directory if it doesn't exist
  if (!existsSync(vscodePromptsPath)) {
    log(`Creating VS Code prompts directory: ${vscodePromptsPath}`);
    await mkdir(vscodePromptsPath, { recursive: true });
  }
  
  // Copy the system prompt
  const sourcePath = path.join(__dirname, '..', config.systemPrompt.source);
  const targetPath = path.join(vscodePromptsPath, config.systemPrompt.filename);
  
  try {
    const promptContent = await readFile(sourcePath, 'utf-8');
    await writeFile(targetPath, promptContent, 'utf-8');
    
    log(`✅ System prompt installed to: ${targetPath}`);
    log('\n🎉 Setup complete!');
    log('\n💡 Usage in VS Code Copilot:');
    log('   /a11y-axe-testing https://example.com');
    log('\n📋 What this prompt does:');
    log('   1. Scans website with AxeCore');
    log('   2. Formats issues with templates');  
    log('   3. Enriches with persona impact');
    log('   4. Creates individual issue files');
    log('   5. Generates executive summary');
    
  } catch (err) {
    error(`Failed to install system prompt: ${err.message}`);
    
    if (err.code === 'ENOENT' && err.path === sourcePath) {
      error('System prompt file not found. Make sure you have the complete bundle.');
    } else if (err.code === 'EACCES') {
      error('Permission denied. Try running with sudo or check directory permissions.');
    }
    
    throw err;
  }
}

async function main() {
  try {
    await installSystemPrompt();
  } catch (err) {
    error('Failed to install system prompt:');
    error(err.message);
    process.exit(1);
  }
}

main();