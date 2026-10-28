import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { EquipamentoService } from '../../core/services/equipamento/equipamento-service';
import { ToastService } from '../../core/services/toast-service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { IEquipamento } from '../../shared/interfaces/IEquipamento';
import { NovaEquipamento } from './nova-equipamento/nova-equipamento';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSquarePen, lucideTrash2 } from '@ng-icons/lucide';
import { CommonModule, DatePipe } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ResumoEquipamento } from './resumo-equipamento/resumo-equipamento';
import { TruncarPipe } from '../../shared/pipes/TruncarPipe';

@Component({
  selector: 'app-equipamento',
  imports: [CommonModule, DatePipe, HlmTableImports, HlmPaginationImports, HlmButtonImports, NgIcon, TruncarPipe],
  providers: [provideIcons({ lucidePlus, lucideSquarePen, lucideTrash2 })],
  styleUrl: './equipamento.css',
  templateUrl: './equipamento.html',
})
export class Equipamento implements OnInit {
  private route = inject(ActivatedRoute);
  private equipamentoService = inject(EquipamentoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  equipamentos = signal<IEquipamento[]>([]);
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
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregar();
    });
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.equipamentoService.buscarPorFazenda(fazendaId, this.paginaAtual(), 10).subscribe({
      next: (res) => {
        this.equipamentos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os equipamentos');
      },
    });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovoEquipamento(): void {
    const dialogRef = this.dialogService.open(NovaEquipamento, {
      context: { fazendaId: this.fazendaId() },
      contentClass: 'sm:!max-w-[750px], sm:!min-w-[550px]',
    });
    dialogRef.closed$.subscribe((sucesso) => {
      if (sucesso) {
        this.toastService.showSuccess('Sucesso', 'Equipamento salvo com sucesso');
        this.carregar();
      }
    });
  }

  abrirResumo(equipamento: IEquipamento): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(ResumoEquipamento, {
      context: { equipamento, fazendaId },
      contentClass: 'sm:!max-w-[850px], sm:!min-w-[650px]',
    });

    dialogRef.closed$.subscribe(() => {
      this.carregar();
    });
  }

  editar(equipamento: IEquipamento): void {
    const dialogRef = this.dialogService.open(NovaEquipamento, {
      context: { fazendaId: this.fazendaId(), equipamento },
      contentClass: 'sm:!max-w-[750px], sm:!min-w-[550px]',
    });
    dialogRef.closed$.subscribe((sucesso) => {
      if (sucesso) {
        this.toastService.showSuccess('Sucesso', 'Equipamento atualizado com sucesso');
        this.carregar();
      }
    });
  }

  inativar(equipamento: IEquipamento): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Inativar equipamento',
        mensagem: `Deseja inativar o equipamento "${equipamento.nome}"?`,
        textoConfirmar: 'Inativar',
      },
    });
    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.equipamentoService.inativar(equipamento.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Equipamento inativado');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível inativar o equipamento'),
        });
      }
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}