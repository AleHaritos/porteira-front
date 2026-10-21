import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { PostoRequest, IPosto, PostoPagamentoRequest } from '../../../shared/interfaces/IPosto';
import { PageResponse } from '../../../shared/interfaces/IPage';
import { UtilService } from '../util-service';

@Service()
export class PostoService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  salvar(request: PostoRequest): Observable<IPosto> {
    return this.http
      .post<IPosto>(`${this.utilService.getUrlBase()}/posto`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }

  listarPorFazenda(fazendaId: number): Observable<IPosto[]> {
    return this.http
      .get<IPosto[]>(`${this.utilService.getUrlBase()}/posto/fazenda/${fazendaId}/todos`)
      .pipe(catchError(this.utilService.errorHandler));
  }

  listarPaginado(fazendaId: number, pagina: number, tamanho: number): Observable<PageResponse<IPosto>> {
    return this.http
      .get<PageResponse<IPosto>>(`${this.utilService.getUrlBase()}/posto/fazenda/${fazendaId}?page=${pagina}&size=${tamanho}`)
      .pipe(catchError(this.utilService.errorHandler));
  }

  registrarPagamento(postoId: number, request: PostoPagamentoRequest): Observable<IPosto> {
    return this.http
      .post<IPosto>(`${this.utilService.getUrlBase()}/posto/${postoId}/pagamento`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }
}