import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import {
  ReabastecimentoEstoqueRequest,
  IEstoqueCombustivel,
  IReabastecimentoHistorico,
} from '../../../shared/interfaces/IEstoqueCombustivel';
import { TipoCombustivel } from '../../../shared/interfaces/IAbastecimento';
import { UtilService } from '../util-service';

@Service()
export class EstoqueCombustivelService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  reabastecer(request: ReabastecimentoEstoqueRequest): Observable<IEstoqueCombustivel> {
    return this.http
      .post<IEstoqueCombustivel>(`${this.utilService.getUrlBase()}/estoque-combustivel/reabastecer`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }

  listarPorFazenda(fazendaId: number): Observable<IEstoqueCombustivel[]> {
    return this.http
      .get<IEstoqueCombustivel[]>(`${this.utilService.getUrlBase()}/estoque-combustivel/fazenda/${fazendaId}`)
      .pipe(catchError(this.utilService.errorHandler));
  }

  listarHistorico(
    fazendaId: number,
    tipoCombustivel: TipoCombustivel,
    dataInicio?: string,
    dataFim?: string,
  ): Observable<IReabastecimentoHistorico[]> {
    let params = new HttpParams().set('tipoCombustivel', tipoCombustivel);
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);

    return this.http
      .get<IReabastecimentoHistorico[]>(
        `${this.utilService.getUrlBase()}/estoque-combustivel/fazenda/${fazendaId}/historico`,
        { params },
      )
      .pipe(catchError(this.utilService.errorHandler));
  }
}