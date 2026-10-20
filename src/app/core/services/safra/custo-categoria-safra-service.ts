import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilService } from '../util-service';
import { ICustosCombustivelManutencao } from '../../../shared/interfaces/ICustosCombustivelManutencao';

@Service()
export class CustoCategoriaSafraService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  buscar(safraId: number): Observable<ICustosCombustivelManutencao> {
    return this.http
      .get<ICustosCombustivelManutencao>(`${this.utilService.getUrlBase()}/custo-categoria-safra/${safraId}`)
      .pipe(catchError(this.utilService.errorHandler));
  }
}