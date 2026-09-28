// core/auth/login/login.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service';
import { AuthService } from '../AuthService';

type Etapa = 'numero' | 'senha' | 'cadastroSenha';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule /* + Hlm*Imports que já tinha */],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  etapa = signal<Etapa>('numero');
  loading = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    numero: ['', [Validators.required]],
    senha: [''],
  });

  entrar() {
    this.erro.set(null);

    if (this.etapa() === 'numero') {
      this.verificarNumero();
      return;
    }

    if (this.etapa() === 'senha') {
      this.fazerLogin();
      return;
    }

    if (this.etapa() === 'cadastroSenha') {
      this.cadastrarSenha();
      return;
    }
  }

  private verificarNumero() {
    const numero = this.form.value.numero!;
    if (!numero) return;

    this.loading.set(true);

    this.usuarioService.validarUsuario(numero).subscribe({
      next: (existeComSenha) => {
        this.loading.set(false);
        this.etapa.set(existeComSenha ? 'senha' : 'cadastroSenha');
        this.form.get('senha')?.setValidators([Validators.required]);
        this.form.get('senha')?.updateValueAndValidity();
      },
      error: () => {
        this.loading.set(false);
        this.erro.set('Não foi possível verificar esse número');
      },
    });
  }

  private fazerLogin() {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.auth
      .login({
        numero: this.form.value.numero!,
        senha: this.form.value.senha!,
      })
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          this.loading.set(false);
          this.erro.set('Número ou senha inválidos');
        },
      });
  }

  private cadastrarSenha() {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.usuarioService
      .atualizarSenha({
        numero: this.form.value.numero!,
        senha: this.form.value.senha!,
      })
      .subscribe({
        next: () => {
          // senha cadastrada, agora faz login de verdade
          this.fazerLogin();
        },
        error: () => {
          this.loading.set(false);
          this.erro.set('Não foi possível cadastrar a senha');
        },
      });
  }

  voltar() {
    this.etapa.set('numero');
    this.form.get('senha')?.reset();
    this.form.get('senha')?.clearValidators();
    this.form.get('senha')?.updateValueAndValidity();
    this.erro.set(null);
  }
}