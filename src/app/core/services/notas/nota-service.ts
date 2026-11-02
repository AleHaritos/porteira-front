import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { INota, INotaRequest } from '../../../shared/interfaces/INota';
import { UtilService } from '../util-service';

@Service()
export class NotaService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/nota';

  buscarPorFazenda(fazendaId: number): Observable<INota[]> {
    return this.http.get<INota[]>(`${this.API_URL}/fazenda/${fazendaId}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  salvar(request: INotaRequest): Observable<INota> {
    return this.http.post<INota>(this.API_URL, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  atualizar(id: number, request: INotaRequest): Observable<INota> {
    return this.http.put<INota>(`${this.API_URL}/${id}`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }
}