import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy-service';
import { delay, finalize, of, tap } from 'rxjs';

const cache = new Map<string, HttpResponse<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  if (req.method === 'GET') {
    const key = req.urlWithParams;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();

  return next(req).pipe(
    delay(500),
    tap(event => {
      if (event instanceof HttpResponse && req.method === 'GET') {
        cache.set(req.urlWithParams, event);
      }
    }),
    finalize(() => {
      busyService.idle();
    })
  );
};