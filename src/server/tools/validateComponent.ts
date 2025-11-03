// src/server/tools/validateComponent.ts
import fs from 'fs';
import path from 'path';
import logger, { LogEntry } from '../../lib/logger';

export interface ValidateComponentInput {
  file_path: string;
  rules?: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  rule: string;
  message: string;
  line?: number;
}

export interface ValidateComponentOutput {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  logs: LogEntry[];
  trace_id: string;
  error_code?: string;
  message?: string;
  hint?: string;
}

export async function validateComponent(input: ValidateComponentInput): Promise<ValidateComponentOutput> {
  const trace_id = `validate-${Date.now()}`;
  const logs: LogEntry[] = [];
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!input.file_path) {
    return {
      valid: false,
      errors,
      warnings,
      logs,
      trace_id,
      error_code: 'missing_field',
      message: 'file_path is required',
      hint: 'Provide path to component file to validate'
    };
  }

  logs.push(logger.info(`Validating component: ${input.file_path}`));

  // Read file
  let content: string;
  try {
    const fullPath = path.resolve(process.cwd(), input.file_path);
    content = fs.readFileSync(fullPath, 'utf8');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      errors,
      warnings,
      logs,
      trace_id,
      error_code: 'read_failed',
      message: `Failed to read file: ${errorMessage}`,
      hint: 'Ensure the file path is correct'
    };
  }

  const rules = input.rules || ['props', 'accessibility', 'tokens'];

  // Run validation rules
  for (const rule of rules) {
    switch (rule) {
      case 'props':
        validateProps(content, errors, warnings);
        break;
      case 'accessibility':
        validateAccessibility(content, errors, warnings);
        break;
      case 'tokens':
        validateTokens(content, errors, warnings);
        break;
      default:
        logs.push(logger.warn(`Unknown validation rule: ${rule}`));
    }
  }

  const valid = errors.length === 0;
  logs.push(logger.info(`Validation ${valid ? 'passed' : 'failed'}: ${errors.length} errors, ${warnings.length} warnings`));

  return {
    valid,
    errors,
    warnings,
    logs,
    trace_id
  };
}

function validateProps(content: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
  // Check for Carbon component imports
  if (!content.includes('carbon-components-react')) {
    warnings.push({
      type: 'warning',
      rule: 'props',
      message: 'Component does not import from carbon-components-react'
    });
  }

  // Check for proper TypeScript prop types
  if (content.includes('export') && content.includes('Props') && !content.includes('interface')) {
    warnings.push({
      type: 'warning',
      rule: 'props',
      message: 'Consider using TypeScript interface for prop types'
    });
  }
}

function validateAccessibility(content: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
  // Check for aria-label on buttons without text
  const buttonRegex = /<Button[^>]*>/g;
  const ariaLabelRegex = /aria-label/;
  
  const buttons = content.match(buttonRegex) || [];
  for (const button of buttons) {
    if (button.includes('icon') && !ariaLabelRegex.test(button)) {
      warnings.push({
        type: 'warning',
        rule: 'accessibility',
        message: 'Icon-only buttons should have aria-label for accessibility'
      });
    }
  }

  // Check for alt text on images
  if (content.includes('<img') && !content.includes('alt=')) {
    errors.push({
      type: 'error',
      rule: 'accessibility',
      message: 'Images must have alt text for accessibility'
    });
  }
}

function validateTokens(content: string, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
  // Check for hardcoded colors instead of tokens
  const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g;
  const colorMatches = content.match(colorRegex);
  
  if (colorMatches && colorMatches.length > 0) {
    warnings.push({
      type: 'warning',
      rule: 'tokens',
      message: `Found ${colorMatches.length} hardcoded color(s). Consider using Carbon design tokens instead.`
    });
  }

  // Check for hardcoded spacing values
  const spacingRegex = /margin:\s*\d+px|padding:\s*\d+px/g;
  const spacingMatches = content.match(spacingRegex);
  
  if (spacingMatches && spacingMatches.length > 0) {
    warnings.push({
      type: 'warning',
      rule: 'tokens',
      message: `Found ${spacingMatches.length} hardcoded spacing value(s). Consider using Carbon spacing tokens.`
    });
  }
}

