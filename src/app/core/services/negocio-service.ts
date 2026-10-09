import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { NegocioRequest, INegocio, NegocioUpdateRequest } from '../../shared/interfaces/INegocio';
import { PageResponse } from '../../shared/interfaces/IPage';
import { UtilService } from './util-service';

@Service()
export class NegocioService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/negocio';

  salvar(request: NegocioRequest): Observable<INegocio> {
    return this.http.post<INegocio>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorFazenda(fazendaId: number, page: number = 0, size: number = 10): Observable<PageResponse<INegocio>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<INegocio>>(this.API_URL + '/fazenda/' + fazendaId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarTodosPorFazenda(fazendaId: number): Observable<INegocio[]> {
    return this.http.get<INegocio[]>(this.API_URL + '/fazenda/' + fazendaId + '/todos').pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  atualizar(id: number, request: NegocioUpdateRequest): Observable<INegocio> {
    return this.http.put<INegocio>(`${this.API_URL}/${id}`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  desativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/desativar`, {}).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  reativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/reativar`, {}).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}
