import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ManutencaoRequest, IManutencao } from '../../../shared/interfaces/IManutencao';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class ManutencaoService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  salvar(request: ManutencaoRequest): Observable<IManutencao> {
    return this.http
      .post<IManutencao>(`${this.utilService.getUrlBase()}/manutencao`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }

  buscarPorVeiculo(veiculoId: number, pagina: number, tamanho: number): Observable<PageResponse<IManutencao>> {
    return this.http
      .get<PageResponse<IManutencao>>(`${this.utilService.getUrlBase()}/manutencao/veiculo/${veiculoId}?page=${pagina}&size=${tamanho}`)
      .pipe(catchError(this.utilService.errorHandler));
  }
}