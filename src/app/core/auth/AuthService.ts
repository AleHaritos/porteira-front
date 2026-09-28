// core/auth/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { UtilService } from '../services/util-service';

export interface LoginRequest {
  numero: string;
  senha: string;
}

export interface TokenResponse {
  token: string;
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  numero: string;
  admin: boolean;
}

const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private util = inject(UtilService)

  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _usuario = signal<UsuarioLogado | null>(null);

  readonly isLoggedIn = computed(() => !!this._token());
  readonly usuario = this._usuario.asReadonly();
  readonly isAdmin = computed(() => this._usuario()?.admin ?? false);

  get token(): string | null {
    return this._token();
  }

  login(credentials: LoginRequest) {
    return this.http.post<TokenResponse>(this.util.getUrlBase() + '/auth/login', credentials).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        this._token.set(res.token);
      }),
    );
  }

  carregarUsuario(): Observable<UsuarioLogado> {
    return this.http
      .get<UsuarioLogado>(this.util.getUrlBase() + '/auth/usuarioLogado')
      .pipe(tap((usuario) => this._usuario.set(usuario)));
  }

  logout() {
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  logoutPorExpiracao() {
    if (this.router.url.startsWith('/login')) return;
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  private limparSessao() {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._usuario.set(null);
  }
}