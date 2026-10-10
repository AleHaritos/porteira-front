import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBriefcase, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { INegocio } from '../../shared/interfaces/INegocio';
import { NovoNegocio } from './novo-negocio/novo-negocio';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ToastService } from '../../core/services/toast-service';
import { NegocioService } from '../../core/services/negocio-service';

@Component({
  selector: 'app-negocios',
  imports: [
    CommonModule,
    HlmTableImports,
    HlmPaginationImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideBriefcase, lucidePencil, lucideTrash2 })],
  styleUrl: './negocios.css',
  templateUrl: './negocios.html',
})
export class Negocios implements OnInit {
  private route = inject(ActivatedRoute);
  private negocioService = inject(NegocioService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  negocios = signal<INegocio[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  paginasVisiveis = computed(() => {
    const atual = this.paginaAtual();
    const total = this.totalPaginas();
    const inicio = Math.max(0, atual - 1);
    const fim = Math.min(total - 1, atual + 1);
    const paginas: number[] = [];
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
  });

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
    this.negocioService.buscarPorFazenda(fazendaId, this.paginaAtual(), 10).subscribe({
      next: (res) => {
        this.negocios.set(res.content);
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

  abrirNovoNegocio() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoNegocio, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[720px], sm:!min-w-[620px]',
    });

    dialogRef.closed$.subscribe((negocioCriado) => {
      if (negocioCriado) {
        this.carregar();
      }
    });
  }

  editar(negocio: INegocio) {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoNegocio, {
      context: { fazendaId, negocio },
      contentClass: 'sm:!max-w-[720px], sm:!min-w-[620px]',
    });

    dialogRef.closed$.subscribe((negocioAtualizado) => {
      if (negocioAtualizado) {
        this.carregar();
      }
    });
  }

  desativar(negocio: INegocio) {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Desativar negócio',
        mensagem: `Tem certeza que deseja desativar o negócio "${negocio.nome}"? Ele deixará de aparecer na listagem.`,
        textoConfirmar: 'Desativar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.negocioService.desativar(negocio.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Negócio desativado com sucesso!');
            this.carregar();
          },
          error: () => {
            this.toastService.showSuccess('Erro', 'Não foi possível desativar o negócio');
          },
        });
      }
    });
  }
}