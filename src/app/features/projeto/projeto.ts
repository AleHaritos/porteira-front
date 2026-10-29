import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHammer, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { IProjeto, StatusProjeto } from '../../shared/interfaces/IProjeto';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ToastService } from '../../core/services/toast-service';
import { ProjetoService } from '../../core/services/projeto/projeto-service';
import { NovoProjeto } from './novo-projeto/novo-projeto';

@Component({
  selector: 'app-projeto',
  imports: [
    CommonModule,
    HlmTableImports,
    HlmPaginationImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideHammer, lucidePencil, lucideTrash2 })],
  styleUrl: './projeto.css',
  templateUrl: './projeto.html',
})
export class Projeto implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projetoService = inject(ProjetoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  projetos = signal<IProjeto[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  paginasVisiveis = computed(() => {
    const atual = this.paginaAtual();
    const total = this.totalPaginas();
    const maxBotoes = 5;

    if (total <= maxBotoes) {
      return Array.from({ length: total }, (_, i) => i);
    }

    let inicio = Math.max(0, atual - Math.floor(maxBotoes / 2));
    let fim = inicio + maxBotoes - 1;

    if (fim > total - 1) {
      fim = total - 1;
      inicio = fim - maxBotoes + 1;
    }

    const paginas: number[] = [];
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
  });

  statusLabel(status: StatusProjeto): string {
    switch (status) {
      case 'PLANEJAMENTO': return 'Planejamento';
      case 'ANDAMENTO': return 'Andamento';
      case 'FINALIZADO': return 'Finalizado';
    }
  }

  statusClasse(status: StatusProjeto): string {
    switch (status) {
      case 'PLANEJAMENTO': return 'projeto-page__status--planejamento';
      case 'ANDAMENTO': return 'projeto-page__status--andamento';
      case 'FINALIZADO': return 'projeto-page__status--finalizado';
    }
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.paginaAtual.set(0);
      this.carregar();
    });
  }

  carregar() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.projetoService.buscarPorFazenda(fazendaId, this.paginaAtual(), 10).subscribe({
      next: (res) => {
        this.projetos.set(res.content);
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

  abrirNovoProjeto() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoProjeto, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[720px], sm:!min-w-[620px]',
    });

    dialogRef.closed$.subscribe((projetoCriado) => {
      if (projetoCriado) {
        this.carregar();
      }
    });
  }

  abrirProjeto(projeto: IProjeto) {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.router.navigate(['/fazenda', fazendaId, 'projetos', projeto.id]);
  }

  editar(projeto: IProjeto) {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoProjeto, {
      context: { fazendaId, projeto },
      contentClass: 'sm:!max-w-[720px], sm:!min-w-[620px]',
    });

    dialogRef.closed$.subscribe((projetoAtualizado) => {
      if (projetoAtualizado) {
        this.carregar();
      }
    });
  }

  desativar(projeto: IProjeto) {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Desativar projeto',
        mensagem: `Tem certeza que deseja desativar o projeto "${projeto.nome}"? Ele deixará de aparecer na listagem.`,
        textoConfirmar: 'Desativar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.projetoService.desativar(projeto.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Projeto desativado com sucesso!');
            this.carregar();
          },
          error: () => {
            this.toastService.showSuccess('Erro', 'Não foi possível desativar o projeto');
          },
        });
      }
    });
  }
}