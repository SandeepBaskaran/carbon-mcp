// src/lib/logger.test.ts
import logger from './logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log info messages', () => {
    const result = logger.info('Test message');
    
    expect(result.level).toBe('info');
    expect(result.message).toBe('Test message');
    expect(result.ts_iso).toBeDefined();
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    const result = logger.error('Error message');
    
    expect(result.level).toBe('error');
    expect(result.message).toBe('Error message');
  });

  it('should redact sensitive information', () => {
    const result = logger.info('Login attempt', {
      username: 'user',
      password: 'secret123',
      token: 'abc123'
    });
    
    const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logOutput.meta.username).toBe('user');
    expect(logOutput.meta.password).toBe('[REDACTED]');
    expect(logOutput.meta.token).toBe('[REDACTED]');
  });

  it('should include metadata when provided', () => {
    const result = logger.info('Test', { count: 5, status: 'ok' });
    
    expect(result.meta).toBeDefined();
    expect(result.meta?.count).toBe(5);
    expect(result.meta?.status).toBe('ok');
  });

  it('should handle nested objects for redaction', () => {
    const result = logger.info('Nested test', {
      user: {
        name: 'John',
        api_key: 'secret'
      }
    });
    
    const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logOutput.meta.user.name).toBe('John');
    expect(logOutput.meta.user.api_key).toBe('[REDACTED]');
  });
});

