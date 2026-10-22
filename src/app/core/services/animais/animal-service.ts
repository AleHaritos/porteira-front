import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { AnimalEmMassaRequest, AnimalRequest, IAnimal, TipoAnimal, VendaAnimalRequest } from '../../../shared/interfaces/IAnimal';
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

  venderAnimais(request: VendaAnimalRequest): Observable<void> {
    return this.http.post<void>(this.API_URL + '/vender', request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}