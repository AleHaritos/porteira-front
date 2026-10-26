import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ManutencaoRequest, IManutencao, IManutencaoResumo } from '../../../shared/interfaces/IManutencao';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class ManutencaoService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/manutencao';

  salvar(request: ManutencaoRequest): Observable<IManutencao> {
    return this.http.post<IManutencao>(this.API_URL, request).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorVeiculoEPeriodo(veiculoId: number, dataInicio: string, dataFim: string, page: number = 0, size: number = 50): Observable<PageResponse<IManutencao>> {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim).set('page', page).set('size', size);
    return this.http.get<PageResponse<IManutencao>>(this.API_URL + '/veiculo/' + veiculoId + '/periodo', { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarResumoPorVeiculo(veiculoId: number, dataInicio: string, dataFim: string): Observable<IManutencaoResumo> {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim);
    return this.http.get<IManutencaoResumo>(this.API_URL + '/veiculo/' + veiculoId + '/resumo', { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  buscarPorVeiculo(veiculoId: number, page: number = 0, size: number = 6): Observable<PageResponse<IManutencao>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<IManutencao>>(this.API_URL + '/veiculo/' + veiculoId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  listarPendentesPorFornecedor(fornecedorId: number): Observable<IManutencao[]> {
    return this.http.get<IManutencao[]>(this.API_URL + '/fornecedor/' + fornecedorId + '/pendentes').pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }

  darBaixa(id: number, dataBaixa: string | null): Observable<IManutencao> {
    const params = dataBaixa ? `?dataBaixa=${dataBaixa}` : '';
    return this.http.patch<IManutencao>(`${this.API_URL}/${id}/baixa${params}`, {}).pipe(
      catchError(e => this.util.errorHandler(e))
    );
  }
}