import { inject, Service } from '@angular/core';
import { UtilService } from '../util-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { EquipamentoRequest, IEquipamento } from '../../../shared/interfaces/IEquipamento';
import { PageResponse } from '../../../shared/interfaces/IPage';

@Service()
export class EquipamentoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/equipamento';

  salvar(request: EquipamentoRequest): Observable<IEquipamento> {
    return this.http.post<IEquipamento>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  atualizar(id: number, request: EquipamentoRequest): Observable<IEquipamento> {
    return this.http.put<IEquipamento>(`${this.API_URL}/${id}`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorFazenda(fazendaId: number, page: number = 0, size: number = 10): Observable<PageResponse<IEquipamento>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<IEquipamento>>(this.API_URL + '/fazenda/' + fazendaId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  inativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}