// src/lib/logger.ts
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  ts_iso: string;
  meta?: Record<string, any>;
}

class Logger {
  private redactKeys = ['token', 'apikey', 'api_key', 'secret', 'password', 'auth'];

  private redact(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const result: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (this.redactKeys.some(k => key.toLowerCase().includes(k))) {
        result[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        result[key] = this.redact(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  }

  private log(level: LogEntry['level'], message: string, meta?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      ts_iso: new Date().toISOString(),
      ...(meta && { meta: this.redact(meta) })
    };
    
    // Output as JSON
    console.log(JSON.stringify(entry));
    return entry;
  }

  info(message: string, meta?: Record<string, any>): LogEntry {
    return this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, any>): LogEntry {
    return this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, any>): LogEntry {
    return this.log('error', message, meta);
  }

  debug(message: string, meta?: Record<string, any>): LogEntry {
    return this.log('debug', message, meta);
  }

  json(level: LogEntry['level'], message: string, meta?: Record<string, any>): LogEntry {
    return this.log(level, message, meta);
  }
}

export default new Logger();

