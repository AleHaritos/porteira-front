import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { AnimalCusto, AnimalEmMassaRequest, AnimalRequest, HistoricoCuidadoAnimal, IAnimal, OperacaoVenda, TipoAnimal, TransferenciaAnimalRequest, VendaAnimalRequest } from '../../../shared/interfaces/IAnimal';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class AnimalService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/animal';

  salvarEmMassa(request: AnimalEmMassaRequest): Observable<IAnimal[]> {
    return this.http.post<IAnimal[]>(this.API_URL + '/em-massa', request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  atualizar(id: number, request: AnimalRequest): Observable<IAnimal> {
    return this.http.put<IAnimal>(`${this.API_URL}/${id}`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPorFazenda(
    fazendaId: number,
    piqueteId: number | null,
    loteId: number | null,
    tipo: TipoAnimal | null,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<IAnimal>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (piqueteId) params = params.set('piqueteId', piqueteId);
    if (loteId) params = params.set('loteId', loteId);
    if (tipo) params = params.set('tipo', tipo);

    return this.http.get<PageResponse<IAnimal>>(this.API_URL + '/fazenda/' + fazendaId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  transferir(request: TransferenciaAnimalRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/transferir`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  vender(request: VendaAnimalRequest): Observable<OperacaoVenda> {
    return this.http.post<OperacaoVenda>(`${this.API_URL}/vender`, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarOperacoesVenda(fazendaId: number): Observable<OperacaoVenda[]> {
    return this.http.get<OperacaoVenda[]>(`${this.API_URL}/vendas/fazenda/${fazendaId}`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  calcularCusto(animalId: number): Observable<AnimalCusto> {
    return this.http.get<AnimalCusto>(`${this.API_URL}/${animalId}/custo`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarHistorico(animalId: number): Observable<HistoricoCuidadoAnimal[]> {
    return this.http.get<HistoricoCuidadoAnimal[]>(`${this.API_URL}/${animalId}/historico`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}