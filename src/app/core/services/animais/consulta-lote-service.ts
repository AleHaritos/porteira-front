import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ConsultaLoteRequest, IConsultaLote } from '../../../shared/interfaces/IConsultaLote ';
import { UtilService } from '../util-service';
import { PageResponse } from '../../../shared/interfaces/IPage';

@Service()
export class ConsultaLoteService {
  private http = inject(HttpClient);
  private util = inject(UtilService);
  private readonly API_URL = this.util.getUrlBase() + '/consulta-lote';

  salvar(request: ConsultaLoteRequest): Observable<IConsultaLote> {
    return this.http.post<IConsultaLote>(this.API_URL, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  buscarPorLote(loteId: number, page: number, size: number): Observable<PageResponse<IConsultaLote>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PageResponse<IConsultaLote>>(`${this.API_URL}/lote/${loteId}`, { params })
      .pipe(catchError((e) => this.util.errorHandler(e)));
  }
}