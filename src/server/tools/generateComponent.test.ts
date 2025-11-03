// src/server/tools/generateComponent.test.ts
import { generateComponent } from './generateComponent';

describe('generateComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when component_name is missing', async () => {
    const result = await generateComponent({ component_name: '' });
    
    expect(result.error_code).toBe('missing_field');
    expect(result.message).toContain('component_name is required');
  });

  it('should generate component in dry-run mode by default', async () => {
    const result = await generateComponent({
      component_name: 'TestButton'
    });
    
    expect(result.dry_run).toBe(true);
    expect(result.files).toHaveLength(3);
    expect(result.files[0].path).toContain('TestButton.tsx');
    expect(result.files[1].path).toContain('TestButton.stories.tsx');
    expect(result.files[2].path).toContain('TestButton.test.tsx');
    expect(result.changed_files).toHaveLength(0);
  });

  it('should include explanation when explain is true', async () => {
    const result = await generateComponent({
      component_name: 'TestButton',
      explain: true
    });
    
    expect(result.explanation).toBeDefined();
    expect(result.explanation).toContain('Generated Carbon React component');
  });

  it('should generate component with custom props', async () => {
    const result = await generateComponent({
      component_name: 'StatusCard',
      props: {
        status: 'string',
        compact: 'boolean'
      },
      dry_run: true
    });
    
    expect(result.files[0].content).toContain('status');
    expect(result.files[0].content).toContain('compact');
  });

  it('should require confirm_destructive for actual file write', async () => {
    const result = await generateComponent({
      component_name: 'TestButton',
      dry_run: false,
      confirm_destructive: false
    });
    
    expect(result.error_code).toBe('confirm_required');
    expect(result.message).toContain('confirm_destructive must be true');
  });

  it('should use custom target_path when provided', async () => {
    const result = await generateComponent({
      component_name: 'TestButton',
      target_path: 'custom/path/TestButton',
      dry_run: true
    });
    
    expect(result.files[0].path).toContain('custom/path/TestButton');
  });

  it('should include trace_id in response', async () => {
    const result = await generateComponent({
      component_name: 'TestButton'
    });
    
    expect(result.trace_id).toBeDefined();
    expect(result.trace_id).toMatch(/^genc-\d+$/);
  });

  it('should include logs in response', async () => {
    const result = await generateComponent({
      component_name: 'TestButton'
    });
    
    expect(result.logs).toBeDefined();
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs.length).toBeGreaterThan(0);
  });
});

