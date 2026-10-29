import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilService } from '../util-service';

export interface ManutencaoParceladaRequest {
  fazendaId: number;
  veiculoId?: number;
  equipamentoId?: number;
  tipo: string;
  descricao?: string;
  kmAtual?: number;
  observacao?: string;
  fornecedorId: number;
  negocioId?: number;
  safraId?: number;
  projetoId?: number;
  primeiraDataVencimento: string;
  valoresParcelas: number[];
}

export interface IManutencaoParcelada {
  id: number;
  veiculoId?: number;
  veiculoNome?: string;
  equipamentoId?: number;
  equipamentoNome?: string;
  tipo: string;
  descricao?: string;
  valorTotal: number;
  numeroParcelas: number;
  fornecedorNome: string;
  vinculoNome?: string;
  observacao?: string;
}

@Service()
export class ManutencaoParceladaService {
  private http = inject(HttpClient);
  private util = inject(UtilService);
  private readonly API_URL = this.util.getUrlBase() + '/manutencao-parcelada';

  salvar(request: ManutencaoParceladaRequest): Observable<IManutencaoParcelada> {
    return this.http.post<IManutencaoParcelada>(this.API_URL, request).pipe(
      catchError((e) => this.util.errorHandler(e))
    );
  }

  darBaixa(parcelaId: number, dataBaixa: string | null): Observable<unknown> {
    const params = dataBaixa ? new HttpParams().set('dataBaixa', dataBaixa) : undefined;
    return this.http.patch(this.API_URL + '/parcela/' + parcelaId + '/baixa', null, { params }).pipe(
      catchError((e) => this.util.errorHandler(e))
    );
  }
}