// src/server/tools/searchDocs.ts
import fs from 'fs';
import path from 'path';
import logger, { LogEntry } from '../../lib/logger';

export interface SearchDocsInput {
  query: string;
  k?: number;
  namespace?: string;
}

export interface SearchResult {
  title: string;
  path: string;
  snippet: string;
  score: number;
}

export interface SearchDocsOutput {
  results: SearchResult[];
  logs: LogEntry[];
  trace_id: string;
}

// Simple keyword-based search (BM25-like scoring)
function calculateScore(query: string, content: string, title: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();
  
  let score = 0;
  
  for (const term of queryTerms) {
    // Title matches are weighted higher
    if (titleLower.includes(term)) {
      score += 10;
    }
    
    // Count occurrences in content
    const regex = new RegExp(term, 'gi');
    const matches = contentLower.match(regex);
    if (matches) {
      score += matches.length * 2;
    }
  }
  
  return score;
}

function extractSnippet(content: string, query: string, maxLength: number = 200): string {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();
  
  // Find first occurrence of any query term
  let bestIndex = -1;
  for (const term of queryTerms) {
    const index = contentLower.indexOf(term);
    if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
      bestIndex = index;
    }
  }
  
  if (bestIndex === -1) {
    return content.substring(0, maxLength) + '...';
  }
  
  // Extract snippet around the match
  const start = Math.max(0, bestIndex - 50);
  const end = Math.min(content.length, bestIndex + maxLength - 50);
  let snippet = content.substring(start, end);
  
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet.trim();
}

export async function searchDocs(input: SearchDocsInput): Promise<SearchDocsOutput> {
  const trace_id = `search-${Date.now()}`;
  const logs: LogEntry[] = [];
  const k = input.k || 5;
  
  logs.push(logger.info(`Searching docs for: "${input.query}"`));
  
  const docsPath = path.join(process.cwd(), 'src/docsIndex');
  const results: SearchResult[] = [];
  
  // Check if docs directory exists
  if (!fs.existsSync(docsPath)) {
    logs.push(logger.warn('Docs index not found, using mock results'));
    
    // Return mock Carbon docs results
    const mockResults: SearchResult[] = [
      {
        title: 'Button — Carbon React',
        path: 'docs/components/button.md',
        snippet: 'The Button component supports kinds: primary, secondary, ghost, danger, and tertiary. Use primary for main actions and secondary for supporting actions.',
        score: 0.98
      },
      {
        title: 'Usage patterns for buttons',
        path: 'docs/patterns/buttons.md',
        snippet: 'Use primary buttons for the main call-to-action. Secondary buttons are for less important actions. Ghost buttons work well on colored backgrounds.',
        score: 0.74
      },
      {
        title: 'Accessibility guidelines',
        path: 'docs/accessibility/buttons.md',
        snippet: 'Buttons should have clear, descriptive labels. Use aria-label when button text is not sufficient. Ensure proper keyboard navigation support.',
        score: 0.65
      }
    ];
    
    return {
      results: mockResults.slice(0, k),
      logs,
      trace_id
    };
  }
  
  // Search actual docs
  try {
    const searchDocs = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchDocs(fullPath);
        } else if (file.endsWith('.md') || file.endsWith('.html')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const title = file.replace(/\.(md|html)$/, '');
            const score = calculateScore(input.query, content, title);
            
            if (score > 0) {
              results.push({
                title,
                path: path.relative(process.cwd(), fullPath),
                snippet: extractSnippet(content, input.query),
                score: score / 100 // normalize
              });
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    };
    
    searchDocs(docsPath);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logs.push(logger.error('Failed to search docs', { error: errorMessage }));
  }
  
  // Sort by score and limit to k results
  results.sort((a, b) => b.score - a.score);
  const topResults = results.slice(0, k);
  
  logs.push(logger.info(`Found ${topResults.length} results`));
  
  return {
    results: topResults,
    logs,
    trace_id
  };
}

