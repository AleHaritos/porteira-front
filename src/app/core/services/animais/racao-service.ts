import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { UtilService } from '../util-service';
import { catchError, Observable } from 'rxjs';
import { RacaoRequest, IRacao } from '../../../shared/interfaces/IRacao';

@Service()
export class RacaoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);
  private readonly baseUrl = this.util.getUrlBase() + '/racao';

  salvar(request: RacaoRequest): Observable<IRacao> {
    return this.http.post<IRacao>(this.baseUrl, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  atualizar(id: number, request: RacaoRequest): Observable<IRacao> {
    return this.http.put<IRacao>(`${this.baseUrl}/${id}`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  listarPorFazenda(fazendaId: number): Observable<IRacao[]> {
    return this.http.get<IRacao[]>(`${this.baseUrl}/fazenda/${fazendaId}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  inativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }
}