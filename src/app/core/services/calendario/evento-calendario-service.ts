import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { EventoCalendarioRequest, IEventoCalendario } from '../../../shared/interfaces/IEventoCalendario';
import { UtilService } from '../util-service';

@Service()
export class EventoCalendarioService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/evento-calendario';

  salvar(request: EventoCalendarioRequest): Observable<IEventoCalendario> {
    return this.http.post<IEventoCalendario>(this.API_URL, request).pipe(
      catchError((e) => this.util.errorHandler(e))
    );
  }

  atualizar(id: number, request: EventoCalendarioRequest): Observable<IEventoCalendario> {
    return this.http.put<IEventoCalendario>(`${this.API_URL}/${id}`, request).pipe(
      catchError((e) => this.util.errorHandler(e))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((e) => this.util.errorHandler(e))
    );
  }

  buscarPorFazendaEPeriodo(fazendaId: number, dataInicio: string, dataFim: string): Observable<IEventoCalendario[]> {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim);
    return this.http.get<IEventoCalendario[]>(`${this.API_URL}/fazenda/${fazendaId}`, { params }).pipe(
      catchError((e) => this.util.errorHandler(e))
    );
  }
}