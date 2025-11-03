// src/server/tools/tokenConverter.ts
import fs from 'fs';
import path from 'path';
import { parseTokensJSON, tokensToCSS, tokensToSCSS, tokensToJS } from '../../lib/tokenUtils';
import { safeWrite } from '../../lib/fileUtils';
import logger, { LogEntry } from '../../lib/logger';

export interface TokenConverterInput {
  input_path: string;
  outputs: Array<'css_vars' | 'scss_map' | 'js_tokens'>;
  output_dir?: string;
  dry_run?: boolean;
  confirm_destructive?: boolean;
}

export interface TokenConverterOutput {
  files: Array<{ path: string; content: string }>;
  logs: LogEntry[];
  dry_run: boolean;
  trace_id: string;
  error_code?: string;
  message?: string;
  hint?: string;
}

export async function tokenConverter(input: TokenConverterInput): Promise<TokenConverterOutput> {
  const trace_id = `token-${Date.now()}`;
  const logs: LogEntry[] = [];
  
  // Validate required fields
  if (!input.input_path || !input.outputs || input.outputs.length === 0) {
    return {
      files: [],
      logs,
      dry_run: true,
      trace_id,
      error_code: 'missing_fields',
      message: 'input_path and outputs are required',
      hint: 'Provide input_path to tokens JSON and outputs array (e.g., ["css_vars", "scss_map"])'
    };
  }

  logs.push(logger.info(`Converting tokens from ${input.input_path}`));

  // Read tokens JSON
  let tokensData: any;
  try {
    const fullPath = path.resolve(process.cwd(), input.input_path);
    const content = fs.readFileSync(fullPath, 'utf8');
    tokensData = JSON.parse(content);
  } catch (error: any) {
    return {
      files: [],
      logs,
      dry_run: true,
      trace_id,
      error_code: 'read_failed',
      message: `Failed to read tokens file: ${error.message}`,
      hint: 'Ensure the file path is correct and the file contains valid JSON'
    };
  }

  // Parse tokens
  const tokens = parseTokensJSON(tokensData);
  logs.push(logger.info(`Parsed ${tokens.length} tokens`));

  const outputDir = input.output_dir || 'tokens';
  const files: Array<{ path: string; content: string }> = [];

  // Generate requested outputs
  for (const format of input.outputs) {
    let fileName: string;
    let content: string;

    switch (format) {
      case 'css_vars':
        fileName = 'tokens.css';
        content = tokensToCSS(tokens);
        break;
      case 'scss_map':
        fileName = 'tokens.scss';
        content = tokensToSCSS(tokens);
        break;
      case 'js_tokens':
        fileName = 'tokens.js';
        content = tokensToJS(tokens);
        break;
      default:
        logs.push(logger.warn(`Unknown output format: ${format}`));
        continue;
    }

    files.push({
      path: path.join(outputDir, fileName),
      content
    });
  }

  logs.push(logger.info(`Generated ${files.length} output files`));

  if (input.dry_run !== false) {
    logs.push(logger.info('Dry-run mode: no files written to disk'));
    return { files, logs, dry_run: true, trace_id };
  }

  if (!input.confirm_destructive) {
    return {
      files,
      logs,
      dry_run: true,
      trace_id,
      error_code: 'confirm_required',
      message: 'confirm_destructive must be true to write files',
      hint: 'Set confirm_destructive to true to write token files to disk'
    };
  }

  // Write files
  for (const f of files) {
    const result = safeWrite(f.path, f.content, {
      dry_run: false,
      confirm_destructive: true
    });
    
    if (result.success) {
      logs.push(logger.info(`Wrote ${f.path}`));
    } else if (result.error) {
      logs.push(logger.error(`Failed to write ${f.path}: ${result.error.message}`));
    }
  }

  return { files, logs, dry_run: false, trace_id };
}

