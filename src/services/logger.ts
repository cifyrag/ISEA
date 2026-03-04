type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'warn';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, context: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
}

function createLogger(context: string) {
  return {
    debug(message: string, ...data: unknown[]) {
      if (shouldLog('debug')) console.debug(formatMessage('debug', context, message), ...data);
    },
    info(message: string, ...data: unknown[]) {
      if (shouldLog('info')) console.info(formatMessage('info', context, message), ...data);
    },
    warn(message: string, ...data: unknown[]) {
      if (shouldLog('warn')) console.warn(formatMessage('warn', context, message), ...data);
    },
    error(message: string, ...data: unknown[]) {
      if (shouldLog('error')) console.error(formatMessage('error', context, message), ...data);
    },
  };
}

export default createLogger;
