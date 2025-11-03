// src/server/toolRegistry.ts
import { generateComponent } from './tools/generateComponent';
import { codemodReplace } from './tools/codemodReplace';
import { searchDocs } from './tools/searchDocs';
import { tokenConverter } from './tools/tokenConverter';
import { validateComponent } from './tools/validateComponent';
import { themePreview } from './tools/themePreview';
import { figmaSync } from './tools/figmaSync';

import generateComponentSchema from '../schemas/generateComponent.json';
import codemodReplaceSchema from '../schemas/codemodReplace.json';
import searchDocsSchema from '../schemas/searchDocs.json';
import tokenConverterSchema from '../schemas/tokenConverter.json';
import validateComponentSchema from '../schemas/validateComponent.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Tool {
  handler: (input: any) => Promise<any>;
  schema: any;
  description: string;
}

export const tools: Record<string, Tool> = {
  generateComponent: {
    handler: generateComponent,
    schema: generateComponentSchema,
    description: 'Generate Carbon React component with Storybook story and tests'
  },
  codemodReplace: {
    handler: codemodReplace,
    schema: codemodReplaceSchema,
    description: 'Apply codemods to convert existing components to Carbon equivalents'
  },
  searchDocs: {
    handler: searchDocs,
    schema: searchDocsSchema,
    description: 'Search Carbon documentation with semantic matching'
  },
  tokenConverter: {
    handler: tokenConverter,
    schema: tokenConverterSchema,
    description: 'Convert design tokens to CSS, SCSS, or JavaScript formats'
  },
  validateComponent: {
    handler: validateComponent,
    schema: validateComponentSchema,
    description: 'Validate component against Carbon patterns and accessibility guidelines'
  },
  themePreview: {
    handler: themePreview,
    schema: {
      name: 'themePreview',
      description: 'Generate static HTML previews for Carbon theme variants',
      input_schema: {
        type: 'object',
        properties: {
          themes: { type: 'array', items: { type: 'string' } },
          output_path: { type: 'string' },
          dry_run: { type: 'boolean', default: true },
          confirm_destructive: { type: 'boolean', default: false }
        }
      }
    },
    description: 'Generate static HTML previews for Carbon themes'
  },
  figmaSync: {
    handler: figmaSync,
    schema: {
      name: 'figmaSync',
      description: 'Scaffold Figma token sync (requires FIGMA_TOKEN)',
      input_schema: {
        type: 'object',
        properties: {
          file_key: { type: 'string' },
          node_id: { type: 'string' },
          export_tokens: { type: 'boolean' },
          import_tokens: { type: 'boolean' },
          dry_run: { type: 'boolean', default: true }
        }
      }
    },
    description: 'Sync design tokens with Figma (scaffold)'
  }
};

export function getToolList(): Array<{ name: string; description: string; schema: any }> {
  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    schema: tool.schema
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

