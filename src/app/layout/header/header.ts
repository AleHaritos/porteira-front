// layout/header/header.ts
import { Component, computed, inject, OnInit } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { AuthService } from '../../core/auth/AuthService';

@Component({
  selector: 'app-header',
  imports: [HlmAvatarImports, HlmButtonImports, HlmDropdownMenuImports],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  private auth = inject(AuthService);

  usuario = this.auth.usuario;

  iniciais = computed(() => {
    const nome = this.usuario()?.nome?.trim();
    if (!nome) return '?';
    const partes = nome.split(/\s+/);
    const primeira = partes[0][0];
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  });

  ngOnInit() {
    if (!this.usuario()) {
      console.log("teste")
      this.auth.carregarUsuario().subscribe({ error: () => {} });
    }
  }

  sair() {
    this.auth.logout();
  }
}