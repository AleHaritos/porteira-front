import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { IResumoAnimais } from '../../../shared/interfaces/IResumoAnimais';
import { UtilService } from '../util-service';

@Injectable({ providedIn: 'root' })
export class ResumoAnimaisService {
  private http = inject(HttpClient);
  private util = inject(UtilService);
  private readonly API_URL = this.util.getUrlBase() + '/resumo-animais';

  buscar(fazendaId: number, dataInicio: string, dataFim: string): Observable<IResumoAnimais> {
    return this.http.get<IResumoAnimais>(this.API_URL, {
      params: { fazendaId, dataInicio, dataFim },
    }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}