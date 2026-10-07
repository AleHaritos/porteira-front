import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { PageResponse } from '../../../shared/intefaces/IPage';
import { TalhaoRequest, ITalhao } from '../../../shared/intefaces/ITalhao';
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

}
