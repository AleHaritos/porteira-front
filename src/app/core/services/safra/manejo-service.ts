import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ManejoRequest, IManejo, ManejoUpdateRequest } from '../../../shared/intefaces/IManejo';
import { PageResponse } from '../../../shared/intefaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class ManejoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/manejo';

  salvar(request: ManejoRequest): Observable<IManejo> {
    return this.http.post<IManejo>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorTalhao(talhaoId: number, page: number = 0, size: number = 7): Observable<PageResponse<IManejo>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<IManejo>>(this.API_URL + '/talhao/' + talhaoId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarTodosPorTalhao(talhaoId: number): Observable<IManejo[]> {
    return this.http.get<IManejo[]>(this.API_URL + '/talhao/' + talhaoId + '/todos').pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  atualizar(id: number, request: ManejoUpdateRequest): Observable<IManejo> {
    return this.http.put<IManejo>(`${this.API_URL}/${id}`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}
