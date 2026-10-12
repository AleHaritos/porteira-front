import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { AbastecimentoRequest, IAbastecimento } from '../../../shared/interfaces/IAbastecimento';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class AbastecimentoService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  salvar(request: AbastecimentoRequest): Observable<IAbastecimento> {
    return this.http
      .post<IAbastecimento>(`${this.utilService.getUrlBase()}/abastecimento`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }

  buscarPorVeiculo(veiculoId: number, pagina: number, tamanho: number): Observable<PageResponse<IAbastecimento>> {
    return this.http
      .get<PageResponse<IAbastecimento>>(`${this.utilService.getUrlBase()}/abastecimento/veiculo/${veiculoId}?page=${pagina}&size=${tamanho}`)
      .pipe(catchError(this.utilService.errorHandler));
  }
}