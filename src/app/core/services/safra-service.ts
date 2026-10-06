import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { UtilService } from './util-service';
import { ISafra, ISafraRequest } from '../../shared/intefaces/ISafras';
import { catchError, map, Observable } from 'rxjs';

@Service()
export class SafraService {
    private http = inject(HttpClient);
    private util = inject(UtilService)

    private readonly API_URL = this.util.getUrlBase() + "/safra"

    salvarFazenda(request: ISafraRequest): Observable<ISafra> {
        return this.http.post<ISafra>(this.API_URL, request).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

    buscarSafrasIdFazenda(fazendaId: number): Observable<ISafra[]> {
        return this.http.get<ISafra[]>(this.API_URL + '/' + fazendaId).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

}
