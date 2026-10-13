import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ReabastecimentoEstoqueRequest, IEstoqueCombustivel } from '../../../shared/interfaces/IEstoqueCombustivel';
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
}