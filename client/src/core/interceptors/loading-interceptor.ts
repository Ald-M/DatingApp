import { HttpEvent, HttpInterceptorFn, HttpParams, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy-service';
import { delay, finalize, of, tap } from 'rxjs';

const cache = new Map<string, HttpResponse<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  const generateCacheKey = (url: string, params: HttpParams): string => {
    const paramString = params.keys().map(key => `${key}=${params.get(key)}`).join('&');
    return paramString ? `${url}?${paramString}` : url;
  }

  const invalidateCache = (urlPattern: string) => {
    for(const key of cache.keys()){
      if (key.includes(urlPattern)){
        cache.delete(key);
        console.log(`Cache invalidated for ${key}`);
      }
    }
  }

  const cachedKey = generateCacheKey(req.url, req.params);

  if (req.method.includes('POST') && req.url.includes('/likes')){
    invalidateCache('/likes')
  }

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cachedKey);

    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();

  return next(req).pipe(
    delay(500),
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(cachedKey, event);
      }
    }),
    finalize(() => {
      busyService.idle();
    })
  );
};