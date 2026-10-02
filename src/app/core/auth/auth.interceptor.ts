// core/http/auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './AuthService';

function isRotaPublica(req: HttpRequest<unknown>): boolean {
  const path = new URL(req.url, window.location.origin).pathname;

  return (
    (req.method === 'POST' && path === '/auth/login') ||
    (req.method === 'PUT' && path === '/usuario') ||
    (req.method === 'GET' && /^\/usuario\/[^/]+$/.test(path))
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  const enviarToken = !!token && !isRotaPublica(req);

  const authReq = enviarToken
    ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && enviarToken) {
        auth.logoutPorExpiracao();
      }
      return throwError(() => error);
    }),
  );
};