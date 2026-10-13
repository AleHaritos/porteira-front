import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { FornecedorRequest, IFornecedor, FornecedorPagamentoRequest } from '../../../shared/interfaces/IFornecedor';
import { UtilService } from '../util-service';

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
    return this.http.get<IFornecedor[]>(this.API_URL + '/fazenda/' + fazendaId).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  registrarPagamento(id: number, request: FornecedorPagamentoRequest): Observable<IFornecedor> {
    return this.http.post<IFornecedor>(`${this.API_URL}/${id}/pagamento`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}
