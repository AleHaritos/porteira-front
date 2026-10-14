import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { LoteRequest, ILote } from '../../../shared/interfaces/ILote';
import { UtilService } from '../util-service';

@Service()
export class LoteService {
  private http = inject(HttpClient);
  private util = inject(UtilService);
  private readonly API_URL = this.util.getUrlBase() + '/lote';

  salvar(request: LoteRequest): Observable<ILote> {
    return this.http.post<ILote>(this.API_URL, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  atualizar(id: number, request: LoteRequest): Observable<ILote> {
    return this.http.put<ILote>(`${this.API_URL}/${id}`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  listarPorFazenda(fazendaId: number): Observable<ILote[]> {
    return this.http.get<ILote[]>(`${this.API_URL}/fazenda/${fazendaId}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  inativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }
}