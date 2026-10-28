import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { FornecedorRequest, IFornecedor } from '../../../shared/interfaces/IFornecedor';
import { UtilService } from '../util-service';
import { PageResponse } from '../../../shared/interfaces/IPage';

@Service()
export class FornecedorService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/fornecedor';

  salvar(request: FornecedorRequest): Observable<IFornecedor> {
    return this.http.post<IFornecedor>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPorFazenda(fazendaId: number): Observable<IFornecedor[]> {
    return this.http.get<IFornecedor[]>(this.API_URL + '/fazenda/' + fazendaId + '/todos').pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorId(id: number): Observable<IFornecedor> {
    return this.http.get<IFornecedor>(`${this.API_URL}/${id}`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPaginado(fazendaId: number, page: number, size: number): Observable<PageResponse<IFornecedor>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<IFornecedor>>(`${this.API_URL}/fazenda/${fazendaId}`, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}