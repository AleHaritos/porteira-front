import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ManutencaoEquipamentoRequest, IManutencaoEquipamento } from '../../../shared/interfaces/IManutencaoEquipamento';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class ManutencaoEquipamentoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/manutencao-equipamento';

  salvar(request: ManutencaoEquipamentoRequest): Observable<IManutencaoEquipamento> {
    return this.http.post<IManutencaoEquipamento>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorFazenda(fazendaId: number, equipamentoId: number | null, dataInicio: string, dataFim: string, page: number = 0, size: number = 6): Observable<PageResponse<IManutencaoEquipamento>> {
    let params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim).set('page', page).set('size', size);
    if (equipamentoId != null) params = params.set('equipamentoId', equipamentoId);
    return this.http.get<PageResponse<IManutencaoEquipamento>>(this.API_URL + '/fazenda/' + fazendaId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPorFornecedorEStatus(fornecedorId: number, status: 'PENDENTE' | 'BAIXADO'): Observable<IManutencaoEquipamento[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<IManutencaoEquipamento[]>(this.API_URL + '/fornecedor/' + fornecedorId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorEquipamento(equipamentoId: number, page: number = 0, size: number = 6): Observable<PageResponse<IManutencaoEquipamento>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<IManutencaoEquipamento>>(this.API_URL + '/equipamento/' + equipamentoId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(this.API_URL + '/' + id).pipe(
      catchError((e) => this.util.errorHandler(e))
    );
  }

  listarPendentesPorFornecedor(fornecedorId: number): Observable<IManutencaoEquipamento[]> {
    return this.http.get<IManutencaoEquipamento[]>(this.API_URL + '/fornecedor/' + fornecedorId + '/pendentes').pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  darBaixa(id: number, dataBaixa: string | null): Observable<IManutencaoEquipamento> {
    const params = dataBaixa ? `?dataBaixa=${dataBaixa}` : '';
    return this.http.patch<IManutencaoEquipamento>(`${this.API_URL}/${id}/baixa${params}`, {}).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}