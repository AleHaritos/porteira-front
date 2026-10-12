import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { PostoRequest, IPosto, PostoPagamentoRequest } from '../../../shared/interfaces/IPosto';
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
      .get<IPosto[]>(`${this.utilService.getUrlBase()}/posto/fazenda/${fazendaId}`)
      .pipe(catchError(this.utilService.errorHandler));
  }

  registrarPagamento(postoId: number, request: PostoPagamentoRequest): Observable<IPosto> {
    return this.http
      .post<IPosto>(`${this.utilService.getUrlBase()}/posto/${postoId}/pagamento`, request)
      .pipe(catchError(this.utilService.errorHandler));
  }
}