import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { OpcaoVinculo, TipoVinculo } from '../../../shared/interfaces/INota';
import { UtilService } from '../util-service';

const ROTAS: Record<TipoVinculo, (fazendaId: number) => string> = {
  SAFRA: (fazendaId) => `/safra/fazenda/${fazendaId}`,
  NEGOCIO: (fazendaId) => `/negocio/fazenda/${fazendaId}`,
  PROJETO: (fazendaId) => `/projeto/fazenda/${fazendaId}`,
};

@Service()
export class NotaOpcoesService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly baseUrl = this.util.getUrlBase();

  listar(tipo: TipoVinculo, fazendaId: number): Observable<OpcaoVinculo[]> {
    return this.http.get<unknown>(this.baseUrl + ROTAS[tipo](fazendaId)).pipe(
      map((resposta) => this.normalizar(resposta)),
      catchError((e) => this.util.errorHandler(e)),
    );
  }

  private normalizar(resposta: unknown): OpcaoVinculo[] {
    const lista = Array.isArray(resposta) ? resposta : ((resposta as { content?: unknown[] })?.content ?? []);

    return (lista as Record<string, unknown>[]).map((item) => ({
      id: Number(item['id']),
      nome: String(item['nome'] ?? item['descricao'] ?? item['titulo'] ?? `#${item['id']}`),
    }));
  }
}