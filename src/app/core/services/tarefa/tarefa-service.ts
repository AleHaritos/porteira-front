import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import {
  ITarefa, ISubTarefa, TarefaRequest, TarefaStatusRequest, SubTarefaRequest,
} from '../../../shared/interfaces/ITarefa';
import { UtilService } from '../util-service';

@Service()
export class TarefaService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/tarefa';

  salvar(request: TarefaRequest): Observable<ITarefa> {
    return this.http.post<ITarefa>(this.API_URL, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  atualizar(id: number, request: TarefaRequest): Observable<ITarefa> {
    return this.http.put<ITarefa>(`${this.API_URL}/${id}`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  atualizarStatus(id: number, request: TarefaStatusRequest): Observable<ITarefa> {
    return this.http.patch<ITarefa>(`${this.API_URL}/${id}/status`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  buscarPorFazenda(fazendaId: number): Observable<ITarefa[]> {
    return this.http.get<ITarefa[]>(`${this.API_URL}/fazenda/${fazendaId}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  adicionarSubtarefa(tarefaId: number, request: SubTarefaRequest): Observable<ISubTarefa> {
    return this.http.post<ISubTarefa>(`${this.API_URL}/${tarefaId}/subtarefa`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  alternarSubtarefa(subtarefaId: number): Observable<ISubTarefa> {
    return this.http.patch<ISubTarefa>(`${this.API_URL}/subtarefa/${subtarefaId}/alternar`, {}).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  excluirSubtarefa(subtarefaId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/subtarefa/${subtarefaId}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }
}