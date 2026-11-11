import React, { ComponentType } from 'react';

const RETRY_FLAG_KEY = 'otelsaas_chunk_retry';

/**
 * Wraps React.lazy with a single automatic page reload if a stale chunk
 * fails to fetch after a fresh deploy.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      const mod = await importer();
      sessionStorage.removeItem(RETRY_FLAG_KEY);
      return mod;
    } catch (error) {
      const hasRetried = sessionStorage.getItem(RETRY_FLAG_KEY) === '1';
      if (!hasRetried) {
        sessionStorage.setItem(RETRY_FLAG_KEY, '1');
        window.location.reload();
        // Keep promise pending while the browser reloads
        return new Promise<{ default: T }>(() => {});
      }
      sessionStorage.removeItem(RETRY_FLAG_KEY);
      throw error;
    }
  });
}

