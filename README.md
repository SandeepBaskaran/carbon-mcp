# carbon-mcp

Local MCP (Model Context Protocol) server for the Carbon Design System — Advanced MVP for internal demos and production use.

## 🚀 Quickstart

1. **Clone repo**
   ```bash
   git clone <repo-url>
   cd carbon-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment** (optional)
   ```bash
   cp .env.example .env
   # Edit .env to add API keys if needed (FIGMA_TOKEN, GITHUB_TOKEN)
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```
   Server will start on `http://localhost:4000`

5. **Test it out**
   ```bash
   # List available tools
   curl http://localhost:4000/tools
   
   # Generate a component (dry-run)
   curl -X POST http://localhost:4000/tool/generateComponent \
     -H "Content-Type: application/json" \
     -d '{"component_name": "PrimaryCard", "dry_run": true}'
   ```

## 🛠️ Tools (MVP)

### Developer Tools

- **`generateComponent`** — Generate Carbon React component + Storybook story + tests (dry-run default)
- **`codemodReplace`** — Apply codemods to convert existing components to Carbon equivalents (dry-run default)
- **`validateComponent`** — Validate component against Carbon patterns and accessibility guidelines
- **`tokenConverter`** — Convert design tokens (JSON) to CSS variables, SCSS maps, and JS tokens

### Documentation Tools

- **`searchDocs`** — Search local Carbon docs index with semantic/keyword matching

### Designer Tools

- **`themePreview`** — Generate static HTML previews for Carbon theme variants (light/dark/custom)
- **`figmaSync`** — Scaffold for Figma token sync (requires FIGMA_TOKEN in environment)

## 🔒 Safety & Destructive Operations

All destructive changes (writing to disk, modifying files) require:

- `confirm_destructive: true`
- `dry_run: false`

**Recommended workflow:**
1. Run with `dry_run: true` (default) to preview changes
2. Review the output/patches
3. Run again with `dry_run: false` and `confirm_destructive: true` to apply

### Example: Generate Component (Safe Workflow)

```bash
# Step 1: Dry-run to preview
curl -X POST http://localhost:4000/tool/generateComponent \
  -H "Content-Type: application/json" \
  -d '{
    "component_name": "PrimaryCard",
    "dry_run": true,
    "explain": true
  }'

# Step 2: Apply changes
curl -X POST http://localhost:4000/tool/generateComponent \
  -H "Content-Type: application/json" \
  -d '{
    "component_name": "PrimaryCard",
    "dry_run": false,
    "confirm_destructive": true
  }'
```

## 📚 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/tools` | List all available tools |
| GET | `/tool/:name/schema` | Get schema for specific tool |
| POST | `/tool/:name` | Execute a tool |

### Tool Examples

#### 1. Generate Component

```json
POST /tool/generateComponent
{
  "component_name": "PrimaryCard",
  "props": {
    "compact": "boolean",
    "icon": "string"
  },
  "target_path": "src/components/PrimaryCard",
  "dry_run": true,
  "explain": true
}
```

**Response:**
```json
{
  "files": [
    {
      "path": "src/components/PrimaryCard/PrimaryCard.tsx",
      "content": "import React from 'react'..."
    }
  ],
  "changed_files": [],
  "dry_run": true,
  "logs": [...],
  "trace_id": "genc-1234567890",
  "explanation": "Generated Carbon React component..."
}
```

#### 2. Codemod Replace

```json
POST /tool/codemodReplace
{
  "codemod_name": "btn-old-to-carbon",
  "files_glob": "src/**/*.{tsx,jsx}",
  "dry_run": true
}
```

**Response:**
```json
{
  "dry_run_result": "3 files would be modified",
  "patches": [
    {
      "file": "src/pages/Home.tsx",
      "patch": "@@ -1,6 +1,6 @@..."
    }
  ],
  "changed_files": ["src/pages/Home.tsx"],
  "logs": [...],
  "trace_id": "codemod-1234567890"
}
```

#### 3. Search Docs

```json
POST /tool/searchDocs
{
  "query": "Carbon Button aria roles",
  "k": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "Button — Carbon React",
      "path": "docs/components/button.md",
      "snippet": "The Button component supports kinds: primary, secondary...",
      "score": 0.98
    }
  ],
  "logs": [...],
  "trace_id": "search-1234567890"
}
```

#### 4. Token Converter

```json
POST /tool/tokenConverter
{
  "input_path": "tokens/tokens.json",
  "outputs": ["css_vars", "scss_map", "js_tokens"],
  "output_dir": "tokens",
  "dry_run": true
}
```

#### 5. Validate Component

```json
POST /tool/validateComponent
{
  "file_path": "src/components/MyButton/MyButton.tsx",
  "rules": ["props", "accessibility", "tokens"]
}
```

**Response:**
```json
{
  "valid": false,
  "errors": [],
  "warnings": [
    {
      "type": "warning",
      "rule": "accessibility",
      "message": "Icon-only buttons should have aria-label"
    }
  ],
  "logs": [...],
  "trace_id": "validate-1234567890"
}
```

#### 6. Theme Preview

```json
POST /tool/themePreview
{
  "themes": ["white", "g10", "g90", "g100"],
  "output_path": "theme-previews",
  "dry_run": true
}
```

## 🔧 Development

### Project Structure

```
carbon-mcp/
├── src/
│   ├── server/
│   │   ├── index.ts                 # Server bootstrap
│   │   ├── toolRegistry.ts          # Tool registration
│   │   └── tools/                   # Tool handlers
│   │       ├── generateComponent.ts
│   │       ├── codemodReplace.ts
│   │       ├── searchDocs.ts
│   │       ├── tokenConverter.ts
│   │       ├── validateComponent.ts
│   │       ├── themePreview.ts
│   │       └── figmaSync.ts
│   ├── lib/                         # Utilities
│   │   ├── logger.ts
│   │   ├── fileUtils.ts
│   │   ├── templateUtils.ts
│   │   ├── codemodUtils.ts
│   │   ├── diffUtils.ts
│   │   └── tokenUtils.ts
│   ├── schemas/                     # JSON schemas
│   └── templates/                   # Component templates
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to dist/
npm start            # Run production server
npm test             # Run tests
npm run lint         # Lint code
```

### Adding a New Tool

1. Create handler in `src/server/tools/myTool.ts`
2. Create schema in `src/schemas/myTool.json`
3. Register in `src/server/toolRegistry.ts`
4. Update this README

## 🧪 Testing

```bash
npm test
```

Tests use Jest + ts-jest. Test files are located next to source files with `.test.ts` extension.

## 🔐 Security & Privacy

- **No secrets in logs**: The logger automatically redacts sensitive keys (tokens, passwords, API keys)
- **Telemetry opt-in**: Set `ANALYTICS_ENABLED=true` in `.env` to enable (disabled by default)
- **File access**: Tools only access files within the repo root
- **Audit trails**: All operations are logged with trace IDs for auditing

## 🌐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4000) |
| `FIGMA_TOKEN` | No | Figma Personal Access Token for figmaSync |
| `GITHUB_TOKEN` | No | GitHub token for PR automation |
| `ANALYTICS_ENABLED` | No | Enable telemetry (default: false) |
| `CARBON_VERSION` | No | Carbon version to use (default: latest) |

## 📖 Common Codemods

### `btn-old-to-carbon`
Replaces old `<button className="btn-old">` with Carbon `<Button kind="primary">`

### `class-to-style`
Refactors className styles that match Carbon tokens into token usage

### `replace-grid`
Swaps custom grid with Carbon Grid

### `image-to-asset`
Converts inline base64 images to static assets

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add tests for new tools
3. Update schemas and documentation
4. Keep tools deterministic and idempotent
5. Use dry-run by default for destructive operations

## 📝 License

MIT

## 🔗 Resources

- [Carbon Design System](https://carbondesignsystem.com/)
- [Carbon React Components](https://react.carbondesignsystem.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

Made with ❤️ for the Carbon Design System community

