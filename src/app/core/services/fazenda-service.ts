import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { UtilService } from './util-service';
import { IFazenda, IFazendaRequest } from '../../shared/interfaces/IFazenda';
import { catchError, map, Observable } from 'rxjs';
import { PageResponse } from '../../shared/interfaces/IPage';

@Service()
export class FazendaService {

    private http = inject(HttpClient);
    private util = inject(UtilService)

    private readonly API_URL = this.util.getUrlBase() + "/fazenda"

    salvarFazenda(request: IFazendaRequest): Observable<IFazenda> {
        return this.http.post<IFazenda>(this.API_URL, request).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

    buscarFazendaPorId(fazendaId: number): Observable<IFazenda> {
        return this.http.get<IFazenda>(this.API_URL + '/' + fazendaId).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

    listarFazendas(page: number = 0, size: number = 5): Observable<PageResponse<IFazenda>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<PageResponse<IFazenda>>(this.API_URL + '/listarFazendas', { params })
            .pipe(
                map((res) => res),
                catchError(e => {
                    return this.util.errorHandler(e)
                })
            )
    }

    atualizar(id: number, request: IFazendaRequest): Observable<IFazenda> {
        return this.http.put<IFazenda>(this.API_URL + '/' + id, request).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

    adicionarColaboradorFazenda(fazendaId: number, numeroColaborador: string): Observable<void> {
        return this.http.post<void>(this.API_URL + '/' + fazendaId + "/colaboradores", { numero: numeroColaborador }).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

    removerColaborador(fazendaId: number, idColaborador: number): Observable<void> {
        return this.http.delete<void>(this.API_URL + '/' + fazendaId + "/colaboradores/" + idColaborador).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
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
}
