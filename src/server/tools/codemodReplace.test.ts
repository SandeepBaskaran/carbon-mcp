// src/server/tools/codemodReplace.test.ts
import { codemodReplace } from './codemodReplace';
import fs from 'fs';
import glob from 'glob';

jest.mock('fs');
jest.mock('glob', () => ({
  sync: jest.fn()
}));

describe('codemodReplace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when required fields are missing', async () => {
    const result = await codemodReplace({
      codemod_name: '',
      files_glob: ''
    });
    
    expect(result.error_code).toBe('missing_fields');
    expect(result.message).toContain('required');
  });

  it('should run in dry-run mode by default', async () => {
    (glob.sync as unknown as jest.Mock).mockReturnValue([]);
    
    const result = await codemodReplace({
      codemod_name: 'btn-old-to-carbon',
      files_glob: 'src/**/*.tsx'
    });
    
    expect(result.dry_run_result).toBeDefined();
    expect(result.patches).toBeDefined();
    expect(Array.isArray(result.patches)).toBe(true);
  });

  it('should find files matching glob pattern', async () => {
    (glob.sync as unknown as jest.Mock).mockReturnValue([
      '/project/src/page1.tsx',
      '/project/src/page2.tsx'
    ]);
    (fs.readFileSync as jest.Mock).mockReturnValue('<button className="btn-old">Click</button>');
    
    const result = await codemodReplace({
      codemod_name: 'btn-old-to-carbon',
      files_glob: 'src/**/*.tsx',
      dry_run: true
    });
    
    expect(glob.sync).toHaveBeenCalledWith('src/**/*.tsx', expect.any(Object));
  });

  it('should require confirm_destructive for actual changes', async () => {
    (glob.sync as unknown as jest.Mock).mockReturnValue([]);
    
    const result = await codemodReplace({
      codemod_name: 'btn-old-to-carbon',
      files_glob: 'src/**/*.tsx',
      dry_run: false,
      confirm_destructive: false
    });
    
    expect(result.error_code).toBe('confirm_required');
  });

  it('should include trace_id and logs', async () => {
    (glob.sync as unknown as jest.Mock).mockReturnValue([]);
    
    const result = await codemodReplace({
      codemod_name: 'btn-old-to-carbon',
      files_glob: 'src/**/*.tsx'
    });
    
    expect(result.trace_id).toMatch(/^codemod-\d+$/);
    expect(result.logs).toBeDefined();
    expect(Array.isArray(result.logs)).toBe(true);
  });
});

