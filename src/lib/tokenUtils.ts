// src/lib/tokenUtils.ts
export interface Token {
  name: string;
  value: string;
  type?: string;
  description?: string;
}

export function tokensToCSS(tokens: Token[]): string {
  const lines = [':root {'];
  for (const token of tokens) {
    const varName = `--${token.name.replace(/\./g, '-')}`;
    lines.push(`  ${varName}: ${token.value};`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function tokensToSCSS(tokens: Token[]): string {
  const lines = ['$carbon-tokens: ('];
  for (const token of tokens) {
    const key = token.name.replace(/\./g, '-');
    lines.push(`  '${key}': ${token.value},`);
  }
  lines.push(');');
  return lines.join('\n');
}

export function tokensToJS(tokens: Token[]): string {
  const lines = ['export const tokens = {'];
  for (const token of tokens) {
    const key = token.name.replace(/[.-]/g, '_');
    lines.push(`  ${key}: '${token.value}',`);
  }
  lines.push('};');
  return lines.join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTokensJSON(json: any): Token[] {
  const tokens: Token[] = [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function traverse(obj: any, prefix: string = '') {
    for (const key in obj) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && value.value !== undefined) {
        tokens.push({
          name: fullKey,
          value: value.value,
          type: value.type,
          description: value.description
        });
      } else if (value && typeof value === 'object') {
        traverse(value, fullKey);
      }
    }
  }
  
  traverse(json);
  return tokens;
}

