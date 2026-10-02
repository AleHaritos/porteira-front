import { Component, computed, effect, inject, input, OnInit, signal, untracked } from '@angular/core';
import { UsuarioService } from '../../core/services/usuario-service';
import { Usuario } from '../../shared/intefaces/IUsuario';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';

@Component({
  imports: [HlmTableImports, HlmDropdownMenuImports, HlmButtonImports, HlmPaginationImports, NgIcon],
  providers: [provideIcons({ lucideEllipsisVertical })],
  selector: 'app-administracao-table',
  styleUrl: './administracao-table.css',
  templateUrl: './administracao-table.html',
})
export class AdministracaoTable {
  private usuarioService = inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);
  recarregar = input(0);

   constructor() {
    effect(() => {
     this.recarregar();
      
     untracked(() => {
      this.paginaAtual.set(0);
      this.carregar();
    });
    });
  }


  paginasVisiveis = computed(() => {
    const atual = this.paginaAtual();
    const total = this.totalPaginas();
    const inicio = Math.max(0, atual - 1);
    const fim = Math.min(total - 1, atual + 1);
    const paginas: number[] = [];
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
  });


  carregar() {
    this.carregando.set(true);
    this.usuarioService.listarUsuarios(this.paginaAtual()).subscribe({
      next: (res) => {
        this.usuarios.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  alternarStatus(usuario: Usuario) {
    const acao = usuario.ativo
      ? this.usuarioService.desativarUsuario(usuario.id)
      : this.usuarioService.reativarUsuario(usuario.id);

    acao.subscribe(() => {
      this.usuarios.update((lista) =>
        lista.map((u) => (u.id === usuario.id ? { ...u, ativo: !usuario.ativo } : u)),
      );
    });
  }

}
