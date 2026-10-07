import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { PageResponse } from '../../../shared/intefaces/IPage';
import { ISafraRequest, ISafra, ISafraUpdateRequest } from '../../../shared/intefaces/ISafras';
import { UtilService } from '../util-service';


@Service()
export class SafraService {
    private http = inject(HttpClient);
    private util = inject(UtilService)

    private readonly API_URL = this.util.getUrlBase() + "/safra"

    salvarSafra(request: ISafraRequest): Observable<ISafra> {
        return this.http.post<ISafra>(this.API_URL, request).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

    atualizar(id: number, req: ISafraUpdateRequest): Observable<ISafra> {
        return this.http
            .put<ISafra>(`${this.API_URL}/${id}`, req)
            .pipe(catchError((e) => this.util.errorHandler(e)));
    }

    buscarSafrasPorFazenda(
        fazendaId: number,
        page: number = 0,
        size: number = 10,
        anoAgricola?: string
    ): Observable<PageResponse<ISafra>> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size);

        if (anoAgricola) {
            params = params.set('anoAgricola', anoAgricola);
        }

        return this.http.get<PageResponse<ISafra>>(this.API_URL + '/' + fazendaId, { params }).pipe(
            catchError(e => {
                return this.util.errorHandler(e);
            })
        );
    }

}