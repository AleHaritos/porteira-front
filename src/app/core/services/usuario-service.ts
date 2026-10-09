import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { UsuarioRequest, Usuario, SenhaRequest } from '../../shared/interfaces/IUsuario';
import { UtilService } from './util-service';
import { PageResponse } from '../../shared/interfaces/IPage';

@Service()
export class UsuarioService {
    private http = inject(HttpClient);
    private util = inject(UtilService)

    private readonly API_URL = this.util.getUrlBase() + "/usuario"

    salvarUsuario(request: UsuarioRequest): Observable<Usuario> {
        return this.http.post<Usuario>(this.API_URL, request)
    }

    validarUsuario(numero: string): Observable<boolean> {
        return this.http.get<boolean>(this.API_URL + '/' + numero).pipe(
            map((res) => res),
        )
    }

    listarTodosMeusCadastros(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.API_URL + '/meus-cadastros/todos').pipe(
            catchError(e => this.util.errorHandler(e))
        );
    }

    listarUsuarios(page: number = 0, size: number = 5): Observable<PageResponse<Usuario>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<PageResponse<Usuario>>(this.API_URL, { params })
            .pipe(
                map((res) => res),
                catchError(e => {
                    return this.util.errorHandler(e)
                })
            )
    }

    desativarUsuario(idUsuario: number): Observable<void> {
        return this.http.patch<void>(this.API_URL + '/' + idUsuario + '/desativar', {}).pipe(
            catchError(e => {
                return this.util.errorHandler(e);
            })
        );
    }

    reativarUsuario(usuarioId: number): Observable<void> {
        return this.http.patch<void>(this.API_URL + '/' + usuarioId + '/reativar', {}).pipe(
            catchError(e => {
                return this.util.errorHandler(e);
            })
        );
    }

    atualizarSenha(request: SenhaRequest): Observable<void> {
        return this.http.put<void>(this.API_URL, request).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

}
