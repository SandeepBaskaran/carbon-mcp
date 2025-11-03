# Contributing to Carbon MCP

Thank you for your interest in contributing to Carbon MCP! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/carbon-mcp.git
   cd carbon-mcp
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🏗️ Development Workflow

### Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## 📝 Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write tests for new features

### Example Function with Documentation

```typescript
/**
 * Generate a Carbon React component with Storybook story and tests
 * @param input - Component generation parameters
 * @returns Generated files with metadata
 */
export async function generateComponent(
  input: GenerateComponentInput
): Promise<GenerateComponentOutput> {
  // Implementation
}
```

## 🔧 Adding a New Tool

### 1. Create the Tool Handler

Create a new file in `src/server/tools/`:

```typescript
// src/server/tools/myTool.ts
import logger, { LogEntry } from '../../lib/logger';

export interface MyToolInput {
  required_param: string;
  optional_param?: string;
  dry_run?: boolean;
  confirm_destructive?: boolean;
}

export interface MyToolOutput {
  result: string;
  logs: LogEntry[];
  trace_id: string;
  error_code?: string;
  message?: string;
  hint?: string;
}

export async function myTool(input: MyToolInput): Promise<MyToolOutput> {
  const trace_id = `mytool-${Date.now()}`;
  const logs: LogEntry[] = [];
  
  // Validate input
  if (!input.required_param) {
    return {
      result: '',
      logs,
      trace_id,
      error_code: 'missing_field',
      message: 'required_param is required',
      hint: 'Provide a required_param value'
    };
  }
  
  logs.push(logger.info('Tool started'));
  
  // Tool implementation
  
  return {
    result: 'success',
    logs,
    trace_id
  };
}
```

### 2. Create the JSON Schema

Create a schema file in `src/schemas/`:

```json
{
  "name": "myTool",
  "description": "Description of what the tool does",
  "input_schema": {
    "type": "object",
    "properties": {
      "required_param": {
        "type": "string",
        "description": "Description of required parameter"
      },
      "optional_param": {
        "type": "string",
        "description": "Description of optional parameter"
      },
      "dry_run": {
        "type": "boolean",
        "default": true
      }
    },
    "required": ["required_param"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "result": { "type": "string" },
      "logs": { "type": "array" },
      "trace_id": { "type": "string" }
    }
  }
}
```

### 3. Register the Tool

Add to `src/server/toolRegistry.ts`:

```typescript
import { myTool } from './tools/myTool';
import myToolSchema from '../schemas/myTool.json';

export const tools: Record<string, Tool> = {
  // ... existing tools
  myTool: {
    handler: myTool,
    schema: myToolSchema,
    description: 'Description of my tool'
  }
};
```

### 4. Write Tests

Create `src/server/tools/myTool.test.ts`:

```typescript
import { myTool } from './myTool';

describe('myTool', () => {
  it('should validate required parameters', async () => {
    const result = await myTool({ required_param: '' });
    expect(result.error_code).toBe('missing_field');
  });
  
  it('should execute successfully with valid input', async () => {
    const result = await myTool({ required_param: 'test' });
    expect(result.result).toBe('success');
    expect(result.trace_id).toBeDefined();
  });
});
```

### 5. Update Documentation

- Add tool description to `README.md`
- Add examples to `mcp-prompt/examples.md`
- Update `mcp-prompt/carbon-mcp-prompt.txt` if needed

## 🧪 Testing Guidelines

### Unit Tests

- Test all public functions
- Test error cases
- Test edge cases
- Use mocks for external dependencies

### Integration Tests

- Test tool execution through the API
- Test dry-run behavior
- Test destructive operation safeguards

### Test Structure

```typescript
describe('ToolName', () => {
  beforeEach(() => {
    // Setup
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  describe('validation', () => {
    it('should validate required fields', () => {
      // Test
    });
  });
  
  describe('execution', () => {
    it('should execute in dry-run mode', () => {
      // Test
    });
  });
});
```

## 🔒 Security Guidelines

1. **Never log secrets**: Use the logger's automatic redaction
2. **Validate all inputs**: Check required fields and types
3. **Default to safe operations**: dry_run should default to true
4. **Require confirmation**: Use confirm_destructive for writes
5. **Sanitize file paths**: Prevent directory traversal attacks
6. **Limit file access**: Only access files within project root

## 📚 Documentation Standards

### Code Documentation

- Use JSDoc for functions and classes
- Document parameters and return types
- Include usage examples
- Note any side effects

### API Documentation

- Document all endpoints
- Provide request/response examples
- List possible error codes
- Include authentication requirements

## 🐛 Bug Reports

When filing a bug report, include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps to reproduce
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: OS, Node version, npm version
6. **Logs**: Relevant logs with trace_id

## ✨ Feature Requests

When requesting a feature:

1. **Use case**: Describe the problem you're trying to solve
2. **Proposed solution**: How you think it should work
3. **Alternatives**: Other solutions you've considered
4. **Examples**: Similar features in other tools

## 📋 Pull Request Process

1. **Update tests**: Add tests for new features
2. **Update documentation**: Update relevant docs
3. **Run tests**: Ensure all tests pass
4. **Run linter**: Fix any linting issues
5. **Describe changes**: Write clear PR description
6. **Link issues**: Reference related issues

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

## 🎯 Development Priorities

Current focus areas:

1. **Core tools stability**: generateComponent, codemodReplace, searchDocs
2. **Test coverage**: Increase coverage to 80%+
3. **Documentation**: Comprehensive examples
4. **Performance**: Optimize large file operations
5. **Integration**: Better Figma and GitHub integration

## 🙏 Questions?

- Check existing issues
- Read the documentation
- Ask in discussions
- Contact maintainers

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Carbon MCP! 🎉

