import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ManutencaoRequest, IManutencao } from '../../../shared/interfaces/IManutencao';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class ManutencaoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/manutencao';

  salvar(request: ManutencaoRequest): Observable<IManutencao> {
    return this.http.post<IManutencao>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorVeiculo(veiculoId: number, page: number = 0, size: number = 6): Observable<PageResponse<IManutencao>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<IManutencao>>(this.API_URL + '/veiculo/' + veiculoId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}