import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilService } from '../util-service';
import { IFornecedorDebito, PageFornecedorDebito } from '../../../shared/interfaces/IFornecedorDebito';

@Service()
export class FornecedorDebitoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);
  private readonly API_URL = this.util.getUrlBase() + '/fornecedor-debito';

   listarPorFornecedorEStatus(
    fornecedorId: number,
    status: 'PENDENTE' | 'BAIXADO',
    dataInicio: string,
    dataFim: string,
    page: number,
    size: number
  ): Observable<PageFornecedorDebito> {
    const params = new HttpParams()
      .set('status', status)
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageFornecedorDebito>(this.API_URL + '/fornecedor/' + fornecedorId, { params }).pipe(
      catchError((e) => this.util.errorHandler(e))
    );
  }
}