import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { ProjetoRequest, IProjeto, ProjetoUpdateRequest } from '../../../shared/interfaces/IProjeto';
import { UtilService } from '../util-service';

@Service()
export class ProjetoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/projeto';

  salvar(request: ProjetoRequest): Observable<IProjeto> {
    return this.http.post<IProjeto>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  atualizar(id: number, request: ProjetoUpdateRequest): Observable<IProjeto> {
    return this.http.put<IProjeto>(`${this.API_URL}/${id}`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorFazenda(fazendaId: number, page: number = 0, size: number = 10): Observable<PageResponse<IProjeto>> {
    return this.http.get<PageResponse<IProjeto>>(this.API_URL + '/fazenda/' + fazendaId, { params: { page, size } }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarTodosPorFazenda(fazendaId: number): Observable<IProjeto[]> {
    return this.http.get<IProjeto[]>(this.API_URL + '/fazenda/' + fazendaId + '/todos').pipe(
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