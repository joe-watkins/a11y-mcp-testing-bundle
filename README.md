# A11y Testing Bundle

A comprehensive accessibility testing bundle that provides seamless one-click installation of multiple MCP (Model Context Protocol) servers for VS Code Copilot accessibility testing workflows.

## What This Bundle Provides

This bundle installs and configures three specialized MCP servers:

1. **AxeCore MCP Server** - Web accessibility scanning using axe-core
2. **ARC Issues Template Writer** - Standardized accessibility issue reporting 
3. **Accessibility Personas MCP** - User personas for accessibility testing scenarios

Together, these servers enable comprehensive accessibility testing workflows through VS Code Copilot with intelligent coordination via system prompts.

## Quick Start

```bash
# Clone this repository
git clone https://github.com/joe-watkins/a11y-testing-bundle.git
cd a11y-testing-bundle

# One-click install everything
npm install
npm run install-all

# Verify installation
npm run status
```

That's it! Restart VS Code and you're ready to go.

## Usage in VS Code Copilot

Once installed, use the system prompt to coordinate all accessibility testing:

```
/a11y-axe-testing https://example.com
```

The system will automatically:
1. Scan the website with AxeCore for accessibility violations
2. Generate detailed issue reports using ARC templates
3. Provide relevant accessibility personas for context
4. Create comprehensive testing recommendations

## Available Scripts

### Installation
- `npm run setup` - Clone and build all MCP servers
- `npm run install-mcp` - Register servers with VS Code
- `npm run install-prompt` - Install system prompt
- `npm run install-all` - **Complete one-click installation**

### Maintenance  
- `npm run update` - Update all server repositories
- `npm run status` - Check installation status
- `npm run uninstall` - Remove everything cleanly

## System Requirements

- **VS Code** with GitHub Copilot extension
- **Node.js 18+** 
- **Git**
- **macOS** (configured for VS Code on Mac - Windows/Linux support coming)

## What Gets Installed

### MCP Servers
The bundle clones, builds, and registers these servers with VS Code:
- `Accessibility Personas - MCP` - Personas for testing scenarios
- `AxeCore - MCP` - Web accessibility scanning
- `ARC Issues Writer - MCP` - Issue template generation

### System Prompt
Installs `/a11y-axe-testing` prompt that coordinates all three servers for comprehensive accessibility testing workflows.

### VS Code Integration
Updates your VS Code `mcp.json` configuration to register all servers with proper stdio communication.

## Manual Installation (If Needed)

If you prefer step-by-step installation:

### 1. Clone and Build MCP Servers
```bash
npm run setup
```

### 2. Register Servers with VS Code
```bash
npm run install-mcp
```

### 3. Install System Prompt
```bash
npm run install-prompt
```

### 4. Restart VS Code
The servers will be available immediately after restart.

## Troubleshooting

### Check Installation Status
```bash
npm run status
```
This will verify all components are properly installed and configured.

### Fix Installation Issues
```bash
npm run install-all  # Reinstall everything
```

### Update Servers
```bash
npm run update  # Pull latest changes and rebuild
```

### Complete Removal
```bash
npm run uninstall  # Clean removal of all components
```

### Common Issues

**"MCP servers not found"**
- Run `npm run status` to check what's missing
- Run `npm run install-all` to reinstall

**"Servers not responding in Copilot"**
- Restart VS Code
- Check VS Code's MCP configuration in Settings

**"Permission errors"**
- Ensure VS Code has proper file system permissions
- Try running with `sudo` if needed (not recommended)

## Architecture

This bundle uses VS Code's native MCP server support through the `mcp.json` configuration file. Each server is registered individually using stdio communication.

**No background orchestration needed** - VS Code spawns servers on-demand and the LLM coordinates their usage based on the system prompt context. This provides:

- ✅ **Simple installation** - Just register servers with VS Code
- ✅ **Reliable operation** - VS Code manages server lifecycle  
- ✅ **Intelligent coordination** - System prompt guides LLM behavior
- ✅ **Resource efficient** - Servers only run when needed

## File Structure

```
a11y-testing-bundle/
├── package.json           # Main installation scripts
├── config.json           # Server configuration 
├── prompts/              # System prompt templates
├── scripts/              # Installation automation
│   ├── clone-repos.js    # Clone MCP servers
│   ├── build-servers.js  # Build server dependencies
│   ├── install-mcp-servers.js # Register with VS Code
│   ├── install-prompt.js # Install system prompt
│   ├── update-repos.js   # Update servers
│   ├── check-installation.js # Verify setup
│   └── uninstall.js      # Clean removal
└── servers/              # Cloned MCP servers (created during setup)
    ├── a11y-personas-mcp/
    ├── axecore-mcp-server/
    └── arc-issues-mcp/
```

## Contributing

Each MCP server has its own repository:
- [AxeCore MCP Server](https://github.com/joe-watkins/axecore-mcp-server)
- [ARC Issues Template Writer](https://github.com/joe-watkins/accessibility-issues-template-mcp)  
- [Accessibility Personas](https://github.com/joe-watkins/a11y-personas-mcp)

For bundle improvements, submit issues/PRs to this repository.

## Team Distribution

This bundle is designed for easy team distribution:

1. **Share the repository** - Team members clone this repo
2. **One command install** - `npm run install-all` 
3. **Restart VS Code** - Ready to use immediately
4. **Consistent setup** - Everyone gets the same configuration

Perfect for teams wanting to standardize their accessibility testing workflow.

## License

MIT

## Example MCP Configuration
``` json
"A11y Personas MCP": {
    "type": "stdio",
    "command": "node",
    "args": [
        "<path-to-bundle>/servers/a11y-personas-mcp/main.js"
    ]
},
"AxeCore MCP": {
    "type": "stdio",
    "command": "node",
    "args": [
        "<path-to-bundle>/servers/axecore-mcp-server/build/index.js"
    ]
},
"ARC Issue Writer MCP": {
    "type": "stdio",
    "command": "node",
    "args": [
        "<path-to-bundle>/servers/accessibility-issues-template-mcp/dist/index.js"
    ]
}
```