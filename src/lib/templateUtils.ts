// src/lib/templateUtils.ts
import { readFileSync } from 'fs';
import path from 'path';
import Mustache from 'mustache';

const TEMPLATES_DIR = path.join(__dirname, '../templates');

export function renderTemplate(templateName: string, context: Record<string, any>): string {
  try {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    const template = readFileSync(templatePath, 'utf8');
    return Mustache.render(template, context);
  } catch (error: any) {
    throw new Error(`Failed to render template ${templateName}: ${error.message}`);
  }
}

export function renderInlineTemplate(template: string, context: Record<string, any>): string {
  return Mustache.render(template, context);
}

