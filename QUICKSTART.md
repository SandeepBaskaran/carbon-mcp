# Quick Start Guide

Get up and running with Carbon MCP in 5 minutes.

## ⚡ Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd carbon-mcp

# Install dependencies
npm install

# Index the documentation
npm run index-docs
```

## 🚀 Start the Server

```bash
# Development mode (recommended for first time)
npm run dev

# The server will start at http://localhost:4000
```

You should see:
```
🚀 Carbon MCP Server running on http://localhost:4000
📚 Available endpoints:
   GET  /health - Health check
   GET  /tools - List all available tools
   GET  /tool/:name/schema - Get tool schema
   POST /tool/:name - Execute tool
```

## ✅ Verify Installation

Test the server is working:

```bash
# Check health
curl http://localhost:4000/health

# List available tools
curl http://localhost:4000/tools
```

## 🎯 First Steps

### 1. Generate Your First Component

```bash
curl -X POST http://localhost:4000/tool/generateComponent \
  -H "Content-Type: application/json" \
  -d '{
    "component_name": "MyButton",
    "dry_run": true,
    "explain": true
  }'
```

This will show you what files would be generated without actually creating them.

### 2. Apply the Generation (If Happy with Preview)

```bash
curl -X POST http://localhost:4000/tool/generateComponent \
  -H "Content-Type: application/json" \
  -d '{
    "component_name": "MyButton",
    "dry_run": false,
    "confirm_destructive": true
  }'
```

Your component files will be created in `src/components/MyButton/`:
- `MyButton.tsx` - Component code
- `MyButton.stories.tsx` - Storybook story
- `MyButton.test.tsx` - Jest tests

### 3. Search Documentation

```bash
curl -X POST http://localhost:4000/tool/searchDocs \
  -H "Content-Type: application/json" \
  -d '{
    "query": "button accessibility",
    "k": 3
  }'
```

### 4. Apply a Codemod

First, create a test file to transform:

```bash
mkdir -p test-project/src
cat > test-project/src/old-button.tsx << 'EOF'
import React from 'react';

export const OldButton = () => {
  return <button className="btn-old">Click me</button>;
};
EOF
```

Then run the codemod in dry-run mode:

```bash
curl -X POST http://localhost:4000/tool/codemodReplace \
  -H "Content-Type: application/json" \
  -d '{
    "codemod_name": "btn-old-to-carbon",
    "files_glob": "test-project/**/*.tsx",
    "dry_run": true
  }'
```

Review the patches, then apply:

```bash
curl -X POST http://localhost:4000/tool/codemodReplace \
  -H "Content-Type: application/json" \
  -d '{
    "codemod_name": "btn-old-to-carbon",
    "files_glob": "test-project/**/*.tsx",
    "dry_run": false,
    "confirm_destructive": true
  }'
```

### 5. Generate Theme Previews

```bash
curl -X POST http://localhost:4000/tool/themePreview \
  -H "Content-Type: application/json" \
  -d '{
    "themes": ["white", "g10", "g90", "g100"],
    "dry_run": false,
    "confirm_destructive": true
  }'
```

Open `theme-previews/index.html` in your browser to view the previews.

## 🎨 Run the Demo App

```bash
cd demo/demo-app
npm install
npm run dev
```

Open http://localhost:3000 to see the demo app with Carbon components.

## 📖 Next Steps

1. **Read the full documentation**: [README.md](README.md)
2. **See more examples**: [mcp-prompt/examples.md](mcp-prompt/examples.md)
3. **Learn to contribute**: [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Explore tools**: Visit http://localhost:4000/tools

## 🔧 Common Issues

### Port Already in Use

If port 4000 is already in use:

```bash
PORT=4001 npm run dev
```

### TypeScript Errors

Make sure TypeScript is installed:

```bash
npm install -g typescript
npx tsc --version
```

### Module Not Found

Clear and reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 💡 Tips

1. **Always dry-run first**: Preview changes before applying
2. **Use explain option**: Get detailed explanations with `"explain": true`
3. **Keep trace_ids**: Store trace IDs from logs for debugging
4. **Review patches**: Always review codemod patches before applying
5. **Check logs**: Use the `logs` field in responses for debugging

## 🎓 Learning Path

1. ✅ Start the server
2. ✅ Generate a simple component
3. ✅ Search documentation
4. ✅ Try a codemod
5. ✅ Generate theme previews
6. 📚 Read full documentation
7. 🛠️ Build your own tools
8. 🤝 Contribute back

## 📞 Need Help?

- Check the [README.md](README.md) for detailed documentation
- Browse [examples.md](mcp-prompt/examples.md) for usage examples
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guide
- File an issue if you find a bug

---

**Ready to build with Carbon?** 🚀

Start by generating your first component and exploring the tools!

