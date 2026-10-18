import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { AbastecimentoRequest, IAbastecimento, IAbastecimentoResumo } from '../../../shared/interfaces/IAbastecimento';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class AbastecimentoService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  salvar(request: AbastecimentoRequest): Observable<IAbastecimento> {
    return this.http
      .post<IAbastecimento>(`${this.utilService.getUrlBase()}/abastecimento`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }

  buscarPorVeiculo(veiculoId: number, pagina: number, tamanho: number): Observable<PageResponse<IAbastecimento>> {
    return this.http
      .get<PageResponse<IAbastecimento>>(`${this.utilService.getUrlBase()}/abastecimento/veiculo/${veiculoId}?page=${pagina}&size=${tamanho}`)
      .pipe(catchError(this.utilService.errorHandler));
  }

  buscarPorFazenda(
    fazendaId: number,
    pagina: number,
    tamanho: number,
    veiculoId?: number | null,
    dataInicio?: string | null,
    dataFim?: string | null,
    negocioId?: number | null,
    safraId?: number | null
  ): Observable<PageResponse<IAbastecimento>> {
    let url = `${this.utilService.getUrlBase()}/abastecimento/fazenda/${fazendaId}?page=${pagina}&size=${tamanho}`;
    if (veiculoId) url += `&veiculoId=${veiculoId}`;
    if (dataInicio) url += `&dataInicio=${dataInicio}`;
    if (dataFim) url += `&dataFim=${dataFim}`;
    if (negocioId) url += `&negocioId=${negocioId}`;
    if (safraId) url += `&safraId=${safraId}`;
    return this.http.get<PageResponse<IAbastecimento>>(url).pipe(catchError(this.utilService.errorHandler));
  }

  buscarResumo(
    fazendaId: number,
    veiculoId?: number | null,
    dataInicio?: string | null,
    dataFim?: string | null,
    negocioId?: number | null,
    safraId?: number | null
  ): Observable<IAbastecimentoResumo> {
    const params: string[] = [];
    if (veiculoId) params.push(`veiculoId=${veiculoId}`);
    if (dataInicio) params.push(`dataInicio=${dataInicio}`);
    if (dataFim) params.push(`dataFim=${dataFim}`);
    if (negocioId) params.push(`negocioId=${negocioId}`);
    if (safraId) params.push(`safraId=${safraId}`);
    let url = `${this.utilService.getUrlBase()}/abastecimento/fazenda/${fazendaId}/resumo`;
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<IAbastecimentoResumo>(url).pipe(catchError(this.utilService.errorHandler));
  }

  buscarPorPosto(postoId: number, pagina: number, tamanho: number): Observable<PageResponse<IAbastecimento>> {
    return this.http
      .get<PageResponse<IAbastecimento>>(`${this.utilService.getUrlBase()}/abastecimento/posto/${postoId}?page=${pagina}&size=${tamanho}`)
      .pipe(catchError(this.utilService.errorHandler));
  }

  darBaixa(abastecimentoId: number, dataBaixa?: string | null): Observable<IAbastecimento> {
    const params = dataBaixa ? `?dataBaixa=${dataBaixa}` : '';
    return this.http
      .patch<IAbastecimento>(`${this.utilService.getUrlBase()}/abastecimento/${abastecimentoId}/baixa${params}`, {})
      .pipe(catchError(this.utilService.errorHandler));
  }
}