import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { IngredienteRequest, IIngrediente } from '../../../shared/interfaces/IIngrediente';
import { UtilService } from '../util-service';

@Service()
export class IngredienteService {
  private http = inject(HttpClient);
  private util = inject(UtilService);
  private readonly baseUrl = this.util.getUrlBase() + '/ingrediente';

  salvar(request: IngredienteRequest): Observable<IIngrediente> {
    return this.http.post<IIngrediente>(this.baseUrl, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  atualizar(id: number, request: IngredienteRequest): Observable<IIngrediente> {
    return this.http.put<IIngrediente>(`${this.baseUrl}/${id}`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  listarPorFazenda(fazendaId: number): Observable<IIngrediente[]> {
    return this.http.get<IIngrediente[]>(`${this.baseUrl}/fazenda/${fazendaId}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  inativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }
}