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

  buscarPorEquipamento(equipamentoId: number, page: number = 0, size: number = 6): Observable<PageResponse<IManutencaoEquipamento>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<IManutencaoEquipamento>>(this.API_URL + '/equipamento/' + equipamentoId, { params }).pipe(
      catchError(e => this.util.errorHandler(e))
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