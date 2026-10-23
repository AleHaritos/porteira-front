import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { CuidadoAnimalRequest, ICuidadoAnimal, PaginaCuidadoAnimal, TipoCuidado } from '../../../shared/interfaces/ICuidadoAnimal';
import { UtilService } from '../util-service';

@Injectable({ providedIn: 'root' })
export class CuidadoAnimalService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/cuidado-animal';

  salvar(request: CuidadoAnimalRequest): Observable<ICuidadoAnimal> {
    return this.http.post<ICuidadoAnimal>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPorPiquete(piqueteId: number, tipo: TipoCuidado, dataInicio: string, dataFim: string, page: number, size: number): Observable<PaginaCuidadoAnimal> {
    return this.http.get<PaginaCuidadoAnimal>(`${this.API_URL}/piquete/${piqueteId}`, {
      params: { tipo, dataInicio, dataFim, page, size },
    }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}