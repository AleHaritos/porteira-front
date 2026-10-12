import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { VeiculoRequest, IVeiculo } from '../../../shared/interfaces/IVeiculos';
import { UtilService } from '../util-service';

@Service()
export class VeiculoService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  salvar(request: VeiculoRequest): Observable<IVeiculo> {
    return this.http
      .post<IVeiculo>(`${this.utilService.getUrlBase()}/veiculo`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }

  atualizar(id: number, request: VeiculoRequest): Observable<IVeiculo> {
    return this.http
      .put<IVeiculo>(`${this.utilService.getUrlBase()}/veiculo/${id}`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }

  buscarPorFazenda(fazendaId: number, pagina: number, tamanho: number): Observable<PageResponse<IVeiculo>> {
    return this.http
      .get<PageResponse<IVeiculo>>(`${this.utilService.getUrlBase()}/veiculo/fazenda/${fazendaId}?page=${pagina}&size=${tamanho}`)
      .pipe(catchError(this.utilService.errorHandler));
  }

  buscarPorId(id: number): Observable<IVeiculo> {
    return this.http
      .get<IVeiculo>(`${this.utilService.getUrlBase()}/veiculo/${id}`)
      .pipe(catchError(this.utilService.errorHandler));
  }

  inativar(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.utilService.getUrlBase()}/veiculo/${id}`)
      .pipe(catchError(this.utilService.errorHandler));
  }
}