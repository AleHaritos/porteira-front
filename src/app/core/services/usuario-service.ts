import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { UsuarioRequest, Usuario, SenhaRequest } from '../../shared/intefaces/IUsuario';
import { UtilService } from './util-service';

@Service()
export class UsuarioService {
    private http = inject(HttpClient);
    private util = inject(UtilService)

    private readonly API_URL = this.util.getUrlBase() + "/usuario"

    salvarUsuario(request: UsuarioRequest): Observable<Usuario> {
        return this.http.post<Usuario>(this.API_URL, request).pipe(
            map((res) => res),
            catchError(e => {
                return this.util.errorHandler(e)
            })
        )
    }

    validarUsuario(numero: string): Observable<boolean> {
        return this.http.get<boolean>(this.API_URL + '/' + numero).pipe(
            map((res) => res),
        )
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
