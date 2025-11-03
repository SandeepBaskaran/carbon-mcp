// src/lib/fileUtils.ts
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import logger from './logger';

export interface WriteOptions {
  dry_run?: boolean;
  confirm_destructive?: boolean;
}

export interface WriteResult {
  success: boolean;
  path?: string;
  error?: {
    error_code: string;
    message: string;
    hint: string;
  };
}

export function safeWrite(
  filePath: string,
  content: string,
  options: WriteOptions = {}
): WriteResult {
  const { dry_run = true, confirm_destructive = false } = options;

  if (dry_run) {
    logger.info(`[DRY-RUN] Would write to ${filePath}`);
    return { success: true, path: filePath };
  }

  if (!confirm_destructive) {
    return {
      success: false,
      error: {
        error_code: 'confirm_required',
        message: 'confirm_destructive must be true to write files',
        hint: 'Set confirm_destructive to true when you want to write files to disk'
      }
    };
  }

  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(fullPath, content, { encoding: 'utf8' });
    logger.info(`Wrote file: ${filePath}`);
    return { success: true, path: filePath };
  } catch (error: any) {
    logger.error(`Failed to write ${filePath}`, { error: error.message });
    return {
      success: false,
      error: {
        error_code: 'write_failed',
        message: error.message,
        hint: 'Check file permissions and path validity'
      }
    };
  }
}

export function ensureDir(dirPath: string): void {
  const fullPath = path.resolve(process.cwd(), dirPath);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

