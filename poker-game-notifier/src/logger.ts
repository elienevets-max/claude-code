import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let logFilePath: string | null = null;
let minLevel: LogLevel = 'info';
let logStream: fs.WriteStream | null = null;

export function initLogger(options?: { filePath?: string; level?: LogLevel }): void {
  minLevel = options?.level || (process.env.LOG_LEVEL as LogLevel) || 'info';

  const filePath = options?.filePath || process.env.LOG_FILE_PATH;
  if (filePath) {
    logFilePath = path.resolve(filePath);
    const dir = path.dirname(logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  }
}

export function closeLogger(): void {
  if (logStream) {
    logStream.end();
    logStream = null;
  }
}

function formatMessage(level: LogLevel, message: string, data?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}${dataStr}`;
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) return;

  const formatted = formatMessage(level, message, data);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }

  if (logStream) {
    logStream.write(formatted + '\n');
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
};
