import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { TalhaoRequest, ITalhao, TalhaoUpdateRequest } from '../../../shared/interfaces/ITalhao';
import { UtilService } from '../util-service';


@Service()
export class TalhaoService {
    private http = inject(HttpClient);
    private util = inject(UtilService);

    private readonly API_URL = this.util.getUrlBase() + '/talhao';

    salvar(request: TalhaoRequest): Observable<ITalhao> {
        return this.http.post<ITalhao>(this.API_URL, request).pipe(
            catchError(e => this.util.errorHandler(e))
        );
    }

    buscarTalhaoPorSafra(safraId: number, page: number = 0, size: number = 7): Observable<PageResponse<ITalhao>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size);

        return this.http.get<PageResponse<ITalhao>>(this.API_URL + '/safra/' + safraId, { params }).pipe(
            catchError(e => this.util.errorHandler(e))
        );
    }

    listarTodosPorSafra(safraId: number): Observable<ITalhao[]> {
        return this.http.get<ITalhao[]>(this.API_URL + '/safra/' + safraId + '/todos').pipe(
            catchError(e => this.util.errorHandler(e))
        );
    }

    desativar(id: number): Observable<void> {
        return this.http
            .patch<void>(`${this.API_URL}/${id}/desativar`, {})
            .pipe(catchError((e) => this.util.errorHandler(e)));
    }

    reativar(id: number): Observable<void> {
        return this.http
            .patch<void>(`${this.API_URL}/${id}/reativar`, {})
            .pipe(catchError((e) => this.util.errorHandler(e)));
    }

    atualizar(id: number, request: TalhaoUpdateRequest): Observable<ITalhao> {
    return this.http
        .put<ITalhao>(`${this.API_URL}/${id}`, request)
        .pipe(catchError((e) => this.util.errorHandler(e)));
}
}
