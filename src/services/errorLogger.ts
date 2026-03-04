import axios from 'axios';

const API_BASE_URL = 'http://localhost:5112';

const logApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

logApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LogEntry {
  level: string;
  message: string;
  stackTrace?: string;
  url?: string;
  timestamp?: string;
  userAgent?: string;
}

let buffer: LogEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 30_000);
}

function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (buffer.length === 0) return;

  const entries = buffer.splice(0, 10);
  logApi.post('/api/client-logs', { entries }).catch(() => {});
}

function addEntry(level: string, message: string, stackTrace?: string) {
  buffer.push({
    level,
    message,
    stackTrace,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });

  if (buffer.length >= 5) {
    flush();
  } else {
    scheduleFlush();
  }
}

export function logError(message: string, stackTrace?: string) {
  addEntry('error', message, stackTrace);
}

export function logWarning(message: string) {
  addEntry('warning', message);
}

export function logInfo(message: string) {
  addEntry('info', message);
}

export function initErrorLogger() {
  window.onerror = (_msg, _source, _lineno, _colno, error) => {
    logError(
      error?.message ?? String(_msg),
      error?.stack ?? `${_source}:${_lineno}:${_colno}`,
    );
  };

  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    logError(
      reason?.message ?? String(reason),
      reason?.stack,
    );
  };

  window.addEventListener('beforeunload', () => {
    flush();
  });
}
