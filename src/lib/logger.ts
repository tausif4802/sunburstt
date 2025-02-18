type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  route?: string;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Keep last 1000 logs in memory

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, message: string, data?: any, route?: string, error?: Error) {
    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      ...(data && { data }),
      ...(route && { route }),
      ...(error && { error }),
    };

    // Add to in-memory logs
    this.logs.unshift(logEntry);

    // Keep only last MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](
        `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`,
        ...(data ? ['\nData:', data] : []),
        ...(error ? ['\nError:', error] : [])
      );
    }

    // In production, you would typically send logs to a service like CloudWatch, Datadog, etc.
    // This is where you'd implement that integration
  }

  info(message: string, data?: any, route?: string) {
    this.addLog('info', message, data, route);
  }

  warn(message: string, data?: any, route?: string) {
    this.addLog('warn', message, data, route);
  }

  error(message: string, error?: Error, data?: any, route?: string) {
    this.addLog('error', message, data, route, error);
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(0, count);
  }

  getLogsByLevel(level: LogLevel, count: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.level === level)
      .slice(0, count);
  }

  getLogsByRoute(route: string, count: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.route === route)
      .slice(0, count);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
