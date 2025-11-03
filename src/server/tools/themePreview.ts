// src/server/tools/themePreview.ts
import { safeWrite } from '../../lib/fileUtils';
import logger, { LogEntry } from '../../lib/logger';

export interface ThemePreviewInput {
  themes?: string[];
  output_path?: string;
  dry_run?: boolean;
  confirm_destructive?: boolean;
}

export interface ThemePreviewOutput {
  files: Array<{ path: string; content: string }>;
  preview_url?: string;
  logs: LogEntry[];
  dry_run: boolean;
  trace_id: string;
}

const previewTemplate = (theme: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carbon Theme Preview - ${theme}</title>
  <link rel="stylesheet" href="https://unpkg.com/carbon-components/css/carbon-components.min.css">
  <style>
    body {
      font-family: 'IBM Plex Sans', sans-serif;
      padding: 2rem;
      background: var(--cds-ui-background);
      color: var(--cds-text-primary);
    }
    .preview-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .preview-section {
      margin-bottom: 3rem;
    }
    .theme-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--cds-ui-01);
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body data-carbon-theme="${theme}">
  <div class="preview-container">
    <div class="theme-badge">
      <strong>Theme:</strong> ${theme}
    </div>
    
    <h1>Carbon Design System - ${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</h1>
    
    <div class="preview-section">
      <h2>Buttons</h2>
      <button class="bx--btn bx--btn--primary">Primary</button>
      <button class="bx--btn bx--btn--secondary">Secondary</button>
      <button class="bx--btn bx--btn--tertiary">Tertiary</button>
      <button class="bx--btn bx--btn--ghost">Ghost</button>
      <button class="bx--btn bx--btn--danger">Danger</button>
    </div>
    
    <div class="preview-section">
      <h2>Form Elements</h2>
      <div class="bx--form-item">
        <label class="bx--label">Text Input</label>
        <input class="bx--text-input" type="text" placeholder="Enter text...">
      </div>
      <div class="bx--form-item">
        <label class="bx--label">Textarea</label>
        <textarea class="bx--text-area" rows="4" placeholder="Enter description..."></textarea>
      </div>
    </div>
    
    <div class="preview-section">
      <h2>Notifications</h2>
      <div class="bx--inline-notification bx--inline-notification--info">
        <div class="bx--inline-notification__details">
          <p class="bx--inline-notification__title">Info notification</p>
          <p class="bx--inline-notification__subtitle">This is an informational message.</p>
        </div>
      </div>
    </div>
    
    <div class="preview-section">
      <h2>Color Tokens</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
        <div style="background: var(--cds-ui-01); padding: 1rem; border-radius: 4px;">UI 01</div>
        <div style="background: var(--cds-ui-02); padding: 1rem; border-radius: 4px;">UI 02</div>
        <div style="background: var(--cds-ui-03); padding: 1rem; border-radius: 4px;">UI 03</div>
        <div style="background: var(--cds-interactive-01); padding: 1rem; border-radius: 4px; color: white;">Interactive</div>
      </div>
    </div>
  </div>
</body>
</html>`;

export async function themePreview(input: ThemePreviewInput): Promise<ThemePreviewOutput> {
  const trace_id = `theme-${Date.now()}`;
  const logs: LogEntry[] = [];
  
  const themes = input.themes || ['white', 'g10', 'g90', 'g100'];
  const outputPath = input.output_path || 'theme-previews';
  
  logs.push(logger.info(`Generating theme previews for: ${themes.join(', ')}`));
  
  const files: Array<{ path: string; content: string }> = [];
  
  for (const theme of themes) {
    files.push({
      path: `${outputPath}/${theme}.html`,
      content: previewTemplate(theme)
    });
  }
  
  // Generate index page
  const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carbon Theme Previews</title>
  <style>
    body { font-family: 'IBM Plex Sans', sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
    h1 { margin-bottom: 2rem; }
    .theme-links { display: grid; gap: 1rem; }
    .theme-link { padding: 1.5rem; background: #f4f4f4; border-radius: 8px; text-decoration: none; color: #161616; display: block; }
    .theme-link:hover { background: #e0e0e0; }
  </style>
</head>
<body>
  <h1>Carbon Theme Previews</h1>
  <div class="theme-links">
    ${themes.map(t => `<a href="${t}.html" class="theme-link"><strong>${t.toUpperCase()}</strong> — ${t === 'white' ? 'Light theme' : t === 'g10' ? 'Light gray' : t === 'g90' ? 'Dark gray' : 'Dark theme'}</a>`).join('\n    ')}
  </div>
</body>
</html>`;
  
  files.push({
    path: `${outputPath}/index.html`,
    content: indexContent
  });
  
  logs.push(logger.info(`Generated ${files.length} preview files`));
  
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
      preview_url: `file://${process.cwd()}/${outputPath}/index.html`
    };
  }
  
  // Write files
  for (const f of files) {
    safeWrite(f.path, f.content, { dry_run: false, confirm_destructive: true });
    logs.push(logger.info(`Wrote ${f.path}`));
  }
  
  return { 
    files, 
    logs, 
    dry_run: false, 
    trace_id,
    preview_url: `file://${process.cwd()}/${outputPath}/index.html`
  };
}

