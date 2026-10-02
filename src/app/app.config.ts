import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/AuthService';
import { catchError, firstValueFrom, of } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
     provideAppInitializer(() => {
      const auth = inject(AuthService);

      if (!auth.token) {
        return Promise.resolve();
      }

      return firstValueFrom(
        auth.carregarUsuario().pipe(
          catchError(() => of(null)),
        ),
      );
    }),
  ],
};
