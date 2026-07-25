/**
 * Centralized logging utility for the application
 * Provides structured logging with different levels and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, error?: unknown): void {
    const context = error instanceof Error 
      ? { error: error.message, stack: error.stack }
      : { error: String(error) };
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown): void {
    const context = error instanceof Error 
      ? { error: error.message, stack: error.stack }
      : { error: String(error) };
    console.error(this.formatMessage('error', message, context));
  }
}

export const logger = new Logger();
