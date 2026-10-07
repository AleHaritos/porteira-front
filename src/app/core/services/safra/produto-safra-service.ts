import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { PageResponse } from '../../../shared/intefaces/IPage';
import { ProdutoSafraRequest, ProdutoSafraUpdateRequest, IProdutoSafra } from '../../../shared/intefaces/IProdutoSafra';
import { UtilService } from '../util-service';

@Service()
export class ProdutoSafraService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/produto-safra';

  salvar(request: ProdutoSafraRequest): Observable<IProdutoSafra> {
    return this.http.post<IProdutoSafra>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  atualizar(id: number, request: ProdutoSafraUpdateRequest): Observable<IProdutoSafra> {
    return this.http.put<IProdutoSafra>(`${this.API_URL}/${id}`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorSafra(safraId: number, page: number = 0, size: number = 7): Observable<PageResponse<IProdutoSafra>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<IProdutoSafra>>(this.API_URL + '/safra/' + safraId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarTodosPorSafra(safraId: number): Observable<IProdutoSafra[]> {
    return this.http.get<IProdutoSafra[]>(this.API_URL + '/safra/' + safraId + '/todos').pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}