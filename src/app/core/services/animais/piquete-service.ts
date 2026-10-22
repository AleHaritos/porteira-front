import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { IPiquete, PiqueteRequest } from '../../../shared/interfaces/IPiquete';
import { UtilService } from '../util-service';

@Service()
export class PiqueteService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/piquete';

  salvar(request: PiqueteRequest): Observable<IPiquete> {
    return this.http.post<IPiquete>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  atualizar(id: number, request: PiqueteRequest): Observable<IPiquete> {
    return this.http.put<IPiquete>(`${this.API_URL}/${id}`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPorFazenda(fazendaId: number): Observable<IPiquete[]> {
    return this.http.get<IPiquete[]>(this.API_URL + '/fazenda/' + fazendaId).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  inativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}