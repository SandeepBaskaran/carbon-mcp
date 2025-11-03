#!/usr/bin/env ts-node
// scripts/index-docs.ts
// Script to index Carbon documentation for searchDocs tool

import fs from 'fs';
import path from 'path';
import https from 'https';

const DOCS_DIR = path.join(__dirname, '../src/docsIndex');
const CARBON_DOCS_URLS = [
  'https://raw.githubusercontent.com/carbon-design-system/carbon/main/docs/README.md',
  // Add more Carbon doc URLs as needed
];

interface DocFile {
  title: string;
  content: string;
  url?: string;
}

async function fetchDoc(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

async function indexDocs() {
  console.log('📚 Starting documentation indexing...');
  
  // Ensure docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
    console.log(`✅ Created directory: ${DOCS_DIR}`);
  }

  // Create sample docs structure
  const sampleDocs: DocFile[] = [
    {
      title: 'button',
      content: `# Button Component

The Button component is used to trigger actions in your application.

## Props

- \`kind\`: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tertiary'
- \`size\`: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- \`disabled\`: boolean
- \`onClick\`: (event) => void

## Accessibility

Buttons should have clear, descriptive labels. Use aria-label when button text is not sufficient.
Ensure proper keyboard navigation support with Tab and Enter/Space keys.

## Usage

\`\`\`tsx
import { Button } from 'carbon-components-react';

<Button kind="primary" onClick={handleClick}>
  Click me
</Button>
\`\`\`

## Best Practices

- Use primary buttons for the main call-to-action
- Use secondary buttons for supporting actions
- Ghost buttons work well on colored backgrounds
- Limit the number of primary buttons per page to one or two
`
    },
    {
      title: 'accessibility',
      content: `# Accessibility Guidelines

Carbon Design System follows WCAG 2.1 Level AA standards.

## Button Accessibility

- All buttons must have accessible labels
- Icon-only buttons require aria-label
- Maintain proper contrast ratios
- Support keyboard navigation
- Provide focus indicators

## Color and Contrast

- Text must have at least 4.5:1 contrast ratio
- Large text (18pt+) needs 3:1 contrast ratio
- Interactive elements need 3:1 contrast ratio against adjacent colors

## Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order should follow logical visual order
- Escape key should close modals and overlays
- Arrow keys for navigation in lists and menus
`
    },
    {
      title: 'tokens',
      content: `# Design Tokens

Design tokens are the visual design atoms of the design system.

## Color Tokens

- \`--cds-interactive-01\`: Primary interactive color
- \`--cds-interactive-02\`: Secondary interactive color
- \`--cds-ui-background\`: Main background color
- \`--cds-text-primary\`: Primary text color
- \`--cds-text-secondary\`: Secondary text color

## Spacing Tokens

- \`--cds-spacing-01\`: 0.125rem (2px)
- \`--cds-spacing-02\`: 0.25rem (4px)
- \`--cds-spacing-03\`: 0.5rem (8px)
- \`--cds-spacing-04\`: 0.75rem (12px)
- \`--cds-spacing-05\`: 1rem (16px)

## Typography Tokens

- \`--cds-productive-heading-01\`: 14px
- \`--cds-productive-heading-02\`: 16px
- \`--cds-body-short-01\`: 14px
- \`--cds-body-long-01\`: 16px
`
    },
    {
      title: 'themes',
      content: `# Carbon Themes

Carbon includes four built-in themes.

## White Theme (Light)

Default light theme with white background.

## G10 Theme (Light Gray)

Light theme with gray 10 background, useful for side panels.

## G90 Theme (Dark Gray)

Dark theme with gray 90 background.

## G100 Theme (Dark)

Darkest theme with gray 100 background, high contrast.

## Theme Switching

\`\`\`tsx
<div data-carbon-theme="g90">
  {/* Your content here */}
</div>
\`\`\`

## Custom Themes

You can create custom themes by overriding token values.
`
    }
  ];

  // Write sample docs
  for (const doc of sampleDocs) {
    const filePath = path.join(DOCS_DIR, `${doc.title}.md`);
    fs.writeFileSync(filePath, doc.content, 'utf8');
    console.log(`✅ Indexed: ${doc.title}.md`);
  }

  // Create index metadata
  const indexMeta = {
    indexed_at: new Date().toISOString(),
    document_count: sampleDocs.length,
    documents: sampleDocs.map(d => ({
      title: d.title,
      file: `${d.title}.md`
    }))
  };

  const metaPath = path.join(DOCS_DIR, 'index.json');
  fs.writeFileSync(metaPath, JSON.stringify(indexMeta, null, 2), 'utf8');
  console.log(`✅ Created index metadata`);

  console.log(`\n🎉 Documentation indexing complete!`);
  console.log(`📁 Location: ${DOCS_DIR}`);
  console.log(`📄 Indexed ${sampleDocs.length} documents`);
}

// Run if called directly
if (require.main === module) {
  indexDocs().catch(console.error);
}

export { indexDocs };

