import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilService } from '../util-service';
import { ColheitaTalhaoRequest, IColheitaTalhao } from '../../../shared/interfaces/IColheitaTalhao';

@Service()
export class ColheitaTalhaoService {
  private http = inject(HttpClient);
  private utilService = inject(UtilService);

  private readonly API_URL = this.utilService.getUrlBase() + '/colheita-talhao';

  salvar(request: ColheitaTalhaoRequest): Observable<IColheitaTalhao> {
    return this.http.post<IColheitaTalhao>(this.API_URL, request).pipe(catchError(this.utilService.errorHandler));
  }

  listarPorTalhao(talhaoId: number): Observable<IColheitaTalhao[]> {
    return this.http.get<IColheitaTalhao[]>(`${this.API_URL}/talhao/${talhaoId}`).pipe(catchError(this.utilService.errorHandler));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(catchError(this.utilService.errorHandler));
  }
}