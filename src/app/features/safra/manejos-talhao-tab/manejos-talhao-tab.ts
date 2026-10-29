import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList, lucideTrash2, lucidePencil, lucideChevronRight } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { IManejo, TipoManejo } from '../../../shared/interfaces/IManejo';
import { NovoManejo } from '../novo-manejo/novo-manejo';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { ManejoService } from '../../../core/services/safra/manejo-service';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-manejos-talhao-tab',
  imports: [CommonModule, HlmPaginationImports, HlmButtonImports, HlmCollapsibleImports, NgIcon, DatePipe],
  providers: [provideIcons({ lucideClipboardList, lucidePencil, lucideTrash2, lucideChevronRight })],
  styleUrl: './manejos-talhao-tab.css',
  templateUrl: './manejos-talhao-tab.html',
})
export class ManejosTalhaoTab implements OnInit {
  private manejoService = inject(ManejoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  talhaoId = input.required<number>();
  safraId = input.required<number>();

  manejoAlterado = output<void>();

  manejos = signal<IManejo[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);
  expandidos = signal<Set<number>>(new Set());

  readonly formatarValor = (valor: number) => moeda.format(valor);

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
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.expandidos.set(new Set());
    this.manejoService.buscarPorTalhao(this.talhaoId(), this.paginaAtual(), 10).subscribe({
      next: (res) => {
        this.manejos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  estaExpandido(id: number): boolean {
    return this.expandidos().has(id);
  }

  onExpandedChange(id: number, expandido: boolean): void {
    const novo = new Set(this.expandidos());
    if (expandido) novo.add(id);
    else novo.delete(id);
    this.expandidos.set(novo);
  }

  abrirNovoManejo(): void {
    const dialogRef = this.dialogService.open(NovoManejo, {
      context: { talhaoId: this.talhaoId(), safraId: this.safraId() },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((manejoCriado) => {
      if (manejoCriado) {
        this.carregar();
        this.manejoAlterado.emit();
      }
    });
  }

  editar(manejo: IManejo): void {
    const dialogRef = this.dialogService.open(NovoManejo, {
      context: { talhaoId: this.talhaoId(), safraId: this.safraId(), manejo },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((manejoAtualizado) => {
      if (manejoAtualizado) {
        this.carregar();
        this.manejoAlterado.emit();
      }
    });
  }

  excluir(manejo: IManejo): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir manejo',
        mensagem: `Tem certeza que deseja excluir o manejo de "${this.tipoLabel(manejo.tipo)}"? Essa ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.manejoService.excluir(manejo.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Manejo excluído com sucesso!');
            this.carregar();
            this.manejoAlterado.emit();
          },
          error: () => {
            this.toastService.showSuccess('Erro', 'Não foi possível excluir o manejo');
          },
        });
      }
    });
  }

  tipoClasse(tipo: string): string {
    const classes: Record<string, string> = {
      PREPARO_DO_SOLO: 'manejos-table__badge--solo',
      PLANTIO: 'manejos-table__badge--plantio',
      ADUBACAO: 'manejos-table__badge--adubacao',
      PULVERIZACAO: 'manejos-table__badge--pulverizacao',
      IRRIGACAO: 'manejos-table__badge--irrigacao',
      COLHEITA: 'manejos-table__badge--colheita',
      OUTROS: 'manejos-table__badge--outros',
    };
    return classes[tipo] || '';
  }

  tipoOptions: { value: TipoManejo; label: string }[] = [
    { value: 'PREPARO_DO_SOLO', label: 'Preparo do solo' },
    { value: 'PLANTIO', label: 'Plantio' },
    { value: 'ADUBACAO', label: 'Adubação' },
    { value: 'PULVERIZACAO', label: 'Pulverização' },
    { value: 'IRRIGACAO', label: 'Irrigação' },
    { value: 'COLHEITA', label: 'Colheita' },
    { value: 'OUTROS', label: 'Outros' },
  ];

  tipoLabel(tipo: string): string {
    return this.tipoOptions.find((o) => o.value === tipo)?.label || tipo;
  }

  produtosResumo(manejo: IManejo): string {
    return manejo.itens.map((i) => `${i.produtoNome} (${i.quantidade})`).join(', ');
  }
}