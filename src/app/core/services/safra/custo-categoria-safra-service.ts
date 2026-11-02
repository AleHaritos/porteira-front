import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilService } from '../util-service';
import { ICustosCombustivelManutencao } from '../../../shared/interfaces/ICustosCombustivelManutencao';

@Service()
export class CustoCategoriaSafraService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  buscar(
    safraId: number,
    dataInicio?: string | null,
    dataFim?: string | null,
  ): Observable<ICustosCombustivelManutencao> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);

    return this.http
      .get<ICustosCombustivelManutencao>(`${this.utilService.getUrlBase()}/custo-categoria-safra/${safraId}`, {
        params,
      })
      .pipe(catchError(this.utilService.errorHandler));
  }
}