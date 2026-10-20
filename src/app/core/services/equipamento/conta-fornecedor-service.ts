import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ContaFornecedorRequest, IContaFornecedor } from '../../../shared/interfaces/IContaFornecedor';
import { UtilService } from '../util-service';

@Service()
export class ContaFornecedorService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/conta-fornecedor';

  salvar(request: ContaFornecedorRequest): Observable<IContaFornecedor> {
    return this.http.post<IContaFornecedor>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPendentesPorFornecedor(fornecedorId: number): Observable<IContaFornecedor[]> {
    return this.http.get<IContaFornecedor[]>(this.API_URL + '/fornecedor/' + fornecedorId + '/pendentes').pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  darBaixa(id: number, negocioId: number | null, safraId: number | null, dataBaixa: string | null): Observable<IContaFornecedor> {
    let params = '';
    if (negocioId) params += `negocioId=${negocioId}`;
    if (safraId) params += `${params ? '&' : ''}safraId=${safraId}`;
    if (dataBaixa) params += `${params ? '&' : ''}dataBaixa=${dataBaixa}`;
    return this.http.patch<IContaFornecedor>(`${this.API_URL}/${id}/baixa${params ? '?' + params : ''}`, {}).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}