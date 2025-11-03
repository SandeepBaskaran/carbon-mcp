# Carbon MCP Examples

This document provides detailed examples of using the Carbon MCP server tools.

## Table of Contents

1. [Generate Component](#1-generate-component)
2. [Apply Codemods](#2-apply-codemods)
3. [Search Documentation](#3-search-documentation)
4. [Convert Tokens](#4-convert-tokens)
5. [Validate Components](#5-validate-components)
6. [Preview Themes](#6-preview-themes)
7. [Figma Sync](#7-figma-sync)

---

## 1. Generate Component

### Basic Component Generation (Dry-Run)

**Request:**
```bash
curl -X POST http://localhost:4000/tool/generateComponent \
  -H "Content-Type: application/json" \
  -d '{
    "component_name": "PrimaryCard",
    "dry_run": true,
    "explain": true
  }'
```

**Response:**
```json
{
  "files": [
    {
      "path": "src/components/PrimaryCard/PrimaryCard.tsx",
      "content": "import React from 'react';\nimport { Button } from 'carbon-components-react';\n\nexport interface PrimaryCardProps {\n  children?: React.ReactNode;\n  kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tertiary';\n}\n\nexport const PrimaryCard: React.FC<PrimaryCardProps> = ({ \n  children, \n  kind = 'primary',\n  ...props\n}) => {\n  return (\n    <Button kind={kind} {...props}>\n      {children}\n    </Button>\n  );\n};\n\nexport default PrimaryCard;"
    },
    {
      "path": "src/components/PrimaryCard/PrimaryCard.stories.tsx",
      "content": "..."
    },
    {
      "path": "src/components/PrimaryCard/PrimaryCard.test.tsx",
      "content": "..."
    }
  ],
  "changed_files": [],
  "dry_run": true,
  "logs": [
    {
      "level": "info",
      "message": "Prepared 3 files for PrimaryCard",
      "ts_iso": "2025-11-02T12:00:00Z"
    }
  ],
  "trace_id": "genc-1730548800000",
  "explanation": "Generated Carbon React component \"PrimaryCard\" with 0 custom props..."
}
```

### Component with Custom Props

**Request:**
```json
{
  "component_name": "StatusCard",
  "props": {
    "status": "string",
    "compact": "boolean",
    "onDismiss": "() => void"
  },
  "target_path": "src/components/cards/StatusCard",
  "dry_run": false,
  "confirm_destructive": true
}
```

---

## 2. Apply Codemods

### Convert Old Buttons to Carbon (Dry-Run)

**Request:**
```bash
curl -X POST http://localhost:4000/tool/codemodReplace \
  -H "Content-Type: application/json" \
  -d '{
    "codemod_name": "btn-old-to-carbon",
    "files_glob": "src/**/*.{tsx,jsx}",
    "dry_run": true
  }'
```

**Response:**
```json
{
  "dry_run_result": "3 files would be modified. Review patches below.",
  "patches": [
    {
      "file": "src/pages/Home.tsx",
      "patch": "@@ -1,6 +1,7 @@\n import React from 'react';\n+import { Button } from 'carbon-components-react';\n \n export const Home = () => {\n   return (\n-    <button className=\"btn-old\">Click me</button>\n+    <Button kind=\"primary\">Click me</Button>\n   );\n };"
    }
  ],
  "changed_files": ["src/pages/Home.tsx"],
  "logs": [
    {
      "level": "info",
      "message": "Running codemod: btn-old-to-carbon",
      "ts_iso": "2025-11-02T12:05:00Z"
    },
    {
      "level": "warn",
      "message": "Dry-run mode: no files changed on disk",
      "ts_iso": "2025-11-02T12:05:01Z"
    }
  ],
  "trace_id": "codemod-1730549100000"
}
```

### Apply Codemod (After Review)

**Request:**
```json
{
  "codemod_name": "btn-old-to-carbon",
  "files_glob": "src/**/*.{tsx,jsx}",
  "dry_run": false,
  "confirm_destructive": true
}
```

---

## 3. Search Documentation

### Search for Button Information

**Request:**
```bash
curl -X POST http://localhost:4000/tool/searchDocs \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Carbon Button aria accessibility",
    "k": 3
  }'
```

**Response:**
```json
{
  "results": [
    {
      "title": "Button — Carbon React",
      "path": "docs/components/button.md",
      "snippet": "The Button component supports kinds: primary, secondary, ghost, danger, and tertiary. Use primary for main actions and secondary for supporting actions.",
      "score": 0.98
    },
    {
      "title": "Accessibility guidelines",
      "path": "docs/accessibility/buttons.md",
      "snippet": "Buttons should have clear, descriptive labels. Use aria-label when button text is not sufficient. Ensure proper keyboard navigation support.",
      "score": 0.85
    },
    {
      "title": "Usage patterns for buttons",
      "path": "docs/patterns/buttons.md",
      "snippet": "Use primary buttons for the main call-to-action. Secondary buttons are for less important actions. Ghost buttons work well on colored backgrounds.",
      "score": 0.74
    }
  ],
  "logs": [
    {
      "level": "info",
      "message": "Searching docs for: \"Carbon Button aria accessibility\"",
      "ts_iso": "2025-11-02T12:10:00Z"
    }
  ],
  "trace_id": "search-1730549400000"
}
```

---

## 4. Convert Tokens

### Example tokens.json

```json
{
  "color": {
    "primary": {
      "value": "#0f62fe",
      "type": "color",
      "description": "Primary brand color"
    },
    "secondary": {
      "value": "#393939",
      "type": "color"
    }
  },
  "spacing": {
    "xs": { "value": "0.25rem", "type": "spacing" },
    "sm": { "value": "0.5rem", "type": "spacing" },
    "md": { "value": "1rem", "type": "spacing" }
  }
}
```

### Convert to Multiple Formats

**Request:**
```json
{
  "input_path": "tokens/tokens.json",
  "outputs": ["css_vars", "scss_map", "js_tokens"],
  "output_dir": "tokens/generated",
  "dry_run": true
}
```

**Response:**
```json
{
  "files": [
    {
      "path": "tokens/generated/tokens.css",
      "content": ":root {\n  --color-primary: #0f62fe;\n  --color-secondary: #393939;\n  --spacing-xs: 0.25rem;\n  --spacing-sm: 0.5rem;\n  --spacing-md: 1rem;\n}"
    },
    {
      "path": "tokens/generated/tokens.scss",
      "content": "$carbon-tokens: (\n  'color-primary': #0f62fe,\n  'color-secondary': #393939,\n  'spacing-xs': 0.25rem,\n  'spacing-sm': 0.5rem,\n  'spacing-md': 1rem,\n);"
    },
    {
      "path": "tokens/generated/tokens.js",
      "content": "export const tokens = {\n  color_primary: '#0f62fe',\n  color_secondary: '#393939',\n  spacing_xs: '0.25rem',\n  spacing_sm: '0.5rem',\n  spacing_md: '1rem',\n};"
    }
  ],
  "logs": [...],
  "dry_run": true,
  "trace_id": "token-1730549700000"
}
```

---

## 5. Validate Components

### Validate a Component File

**Request:**
```json
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
      "message": "Icon-only buttons should have aria-label for accessibility"
    },
    {
      "type": "warning",
      "rule": "tokens",
      "message": "Found 2 hardcoded color(s). Consider using Carbon design tokens instead."
    }
  ],
  "logs": [
    {
      "level": "info",
      "message": "Validating component: src/components/MyButton/MyButton.tsx",
      "ts_iso": "2025-11-02T12:20:00Z"
    },
    {
      "level": "info",
      "message": "Validation passed: 0 errors, 2 warnings",
      "ts_iso": "2025-11-02T12:20:01Z"
    }
  ],
  "trace_id": "validate-1730550000000"
}
```

---

## 6. Preview Themes

### Generate Theme Previews

**Request:**
```json
{
  "themes": ["white", "g10", "g90", "g100"],
  "output_path": "theme-previews",
  "dry_run": false,
  "confirm_destructive": true
}
```

**Response:**
```json
{
  "files": [
    {
      "path": "theme-previews/white.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "theme-previews/g10.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "theme-previews/g90.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "theme-previews/g100.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "theme-previews/index.html",
      "content": "<!DOCTYPE html>..."
    }
  ],
  "preview_url": "file:///path/to/carbon-mcp/theme-previews/index.html",
  "logs": [...],
  "dry_run": false,
  "trace_id": "theme-1730550300000"
}
```

Open `theme-previews/index.html` in a browser to view all theme previews.

---

## 7. Figma Sync

### Export Tokens from Figma (Requires Setup)

**Request:**
```json
{
  "file_key": "abc123xyz",
  "node_id": "1:2",
  "export_tokens": true,
  "dry_run": true
}
```

**Response (Setup Required):**
```json
{
  "status": "setup_required",
  "logs": [
    {
      "level": "warn",
      "message": "FIGMA_TOKEN not found in environment",
      "ts_iso": "2025-11-02T12:30:00Z"
    }
  ],
  "trace_id": "figma-1730550600000",
  "needs_setup": true,
  "setup_instructions": "To use Figma sync, you need to:\n1. Get a Figma Personal Access Token from https://www.figma.com/developers/api#access-tokens\n2. Add it to your .env file: FIGMA_TOKEN=your_token_here\n3. Provide file_key from your Figma file URL..."
}
```

**Response (After Setup):**
```json
{
  "status": "success",
  "tokens": {
    "colors": {
      "primary": "#0f62fe",
      "secondary": "#393939"
    },
    "spacing": {
      "xs": "0.25rem",
      "sm": "0.5rem",
      "md": "1rem"
    }
  },
  "logs": [...],
  "trace_id": "figma-1730550900000"
}
```

---

## Error Handling Examples

### Missing Required Field

**Request:**
```json
{
  "dry_run": true
}
```

**Response:**
```json
{
  "files": [],
  "changed_files": [],
  "dry_run": true,
  "logs": [],
  "trace_id": "genc-1730551200000",
  "error_code": "missing_field",
  "message": "component_name is required",
  "hint": "Provide a component_name like \"PrimaryCard\""
}
```

### Destructive Operation Without Confirmation

**Request:**
```json
{
  "component_name": "TestCard",
  "dry_run": false
}
```

**Response:**
```json
{
  "files": [...],
  "changed_files": [],
  "dry_run": true,
  "logs": [],
  "trace_id": "genc-1730551500000",
  "error_code": "confirm_required",
  "message": "confirm_destructive must be true to write files",
  "hint": "Set confirm_destructive to true when you want to write files to disk"
}
```

---

## Best Practices

1. **Always dry-run first**: Review changes before applying
2. **Use explain option**: Get detailed explanations for complex operations
3. **Validate after generation**: Run validateComponent after generating new components
4. **Keep trace_ids**: Store trace_ids for audit trails and debugging
5. **Review patches**: Always review codemod patches before applying
6. **Use proper globs**: Be specific with file patterns to avoid unintended changes
7. **Check logs**: Review logs for warnings and errors
8. **Test generated code**: Run tests after generating or modifying components

---

## Integration with Cursor/MCP

When using with Cursor or other MCP clients, you can register the server and call tools directly:

```typescript
// Example MCP client usage
const result = await mcp.callTool('generateComponent', {
  component_name: 'MyButton',
  props: { variant: 'string' },
  dry_run: true,
  explain: true
});

console.log(result.explanation);
console.log(result.files);
```

---

For more information, see the main [README.md](../README.md).

