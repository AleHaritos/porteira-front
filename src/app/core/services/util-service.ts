import { inject, Service } from '@angular/core';
import { ToastService } from './toast-service';
import { EMPTY, Observable, throwError } from 'rxjs';

@Service()
export class UtilService {
    private URL_BASE: string = "http://localhost:8080"
    private toastService = inject(ToastService);

    getUrlBase(): string {
        return this.URL_BASE;
    }

    errorValidation(e: any) {
        let status = e.status
        switch (status) {
            case 400: {
                this.toastService.showError('Erro', e.error.detail)
                break
            }
            case 500: {
                this.toastService.showError('Erro', e.error.detail)
                break
            }
            case 404: {
                this.toastService.showWarning('Atenção', e.error.detail)
                break
            }
            case 422: {
                this.toastService.showError('Atenção', e.error.detail)
            }
        }
    }

    errorHandler(e: any): Observable<any> {
        this.errorValidation(e);
        return throwError(() => e);
    }
}
