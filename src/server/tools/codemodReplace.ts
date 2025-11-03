// src/server/tools/codemodReplace.ts
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import { applyJSCodemod } from '../../lib/codemodUtils';
import { generateUnifiedDiff, applyPatchFromUnifiedDiff } from '../../lib/diffUtils';
import logger, { LogEntry } from '../../lib/logger';

export interface CodemodReplaceInput {
  codemod_name: string;
  files_glob: string;
  rules?: any;
  dry_run?: boolean;
  confirm_destructive?: boolean;
}

export interface CodemodReplaceOutput {
  dry_run_result?: string;
  patches: Array<{ file: string; patch: string }>;
  changed_files: string[];
  logs: LogEntry[];
  trace_id: string;
  error_code?: string;
  message?: string;
  hint?: string;
}

export async function codemodReplace(input: CodemodReplaceInput): Promise<CodemodReplaceOutput> {
  const trace_id = `codemod-${Date.now()}`;
  const logs: LogEntry[] = [];

  // Validate required fields
  if (!input.codemod_name || !input.files_glob) {
    return {
      patches: [],
      changed_files: [],
      logs,
      trace_id,
      error_code: 'missing_fields',
      message: 'codemod_name and files_glob are required',
      hint: 'Provide both codemod_name (e.g., "btn-old-to-carbon") and files_glob (e.g., "src/**/*.tsx")'
    };
  }

  logs.push(logger.info(`Running codemod: ${input.codemod_name}`));
  logs.push(logger.info(`Files glob: ${input.files_glob}`));

  const matches = glob.sync(input.files_glob, { 
    cwd: process.cwd(), 
    absolute: true,
    nodir: true 
  });

  logs.push(logger.info(`Found ${matches.length} files matching glob pattern`));

  const patches: Array<{ file: string; patch: string }> = [];
  const transformedContent: Map<string, string> = new Map();

  for (const filePath of matches) {
    try {
      const original = fs.readFileSync(filePath, 'utf8');
      const transformed = applyJSCodemod(original, input.codemod_name, input.rules || {});

      if (original !== transformed) {
        const relativePath = path.relative(process.cwd(), filePath);
        const patch = generateUnifiedDiff(original, transformed, relativePath);
        patches.push({ file: relativePath, patch });
        transformedContent.set(filePath, transformed);
      }
    } catch (error: any) {
      logs.push(logger.error(`Failed to process ${filePath}`, { error: error.message }));
    }
  }

  logs.push(logger.info(`${patches.length} file(s) would be modified`));

  if (input.dry_run !== false) {
    const dry_run_result = `${patches.length} files would be modified. ${patches.length > 0 ? 'Review patches below.' : 'No changes needed.'}`;
    logs.push(logger.warn('Dry-run mode: no files changed on disk'));
    return { 
      dry_run_result, 
      patches, 
      changed_files: patches.map(p => p.file), 
      logs, 
      trace_id 
    };
  }

  if (!input.confirm_destructive) {
    return {
      patches,
      changed_files: patches.map(p => p.file),
      logs,
      trace_id,
      error_code: 'confirm_required',
      message: 'Set confirm_destructive = true to apply codemod changes to disk',
      hint: 'Review the patches in dry-run mode first, then set confirm_destructive: true'
    };
  }

  // Apply patches
  const changed: string[] = [];
  for (const [filePath, newContent] of transformedContent.entries()) {
    try {
      fs.writeFileSync(filePath, newContent, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      changed.push(relativePath);
      logs.push(logger.info(`Applied patch to ${relativePath}`));
    } catch (error: any) {
      logs.push(logger.error(`Failed to write ${filePath}`, { error: error.message }));
    }
  }

  return { 
    patches, 
    changed_files: changed, 
    dry_run_result: `Applied changes to ${changed.length} files`,
    logs, 
    trace_id 
  };
}

