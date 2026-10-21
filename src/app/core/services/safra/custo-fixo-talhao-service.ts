import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { CustoFixoTalhaoRequest, ICustoFixoTalhao } from '../../../shared/interfaces/ICustoFixoTalhao';
import { UtilService } from '../util-service';

@Injectable({ providedIn: 'root' })
export class CustoFixoTalhaoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/custo-fixo-talhao';

  salvar(request: CustoFixoTalhaoRequest): Observable<ICustoFixoTalhao> {
    return this.http.post<ICustoFixoTalhao>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPorTalhao(talhaoId: number): Observable<ICustoFixoTalhao[]> {
    return this.http.get<ICustoFixoTalhao[]>(this.API_URL + '/talhao/' + talhaoId).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(this.API_URL + '/' + id).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}