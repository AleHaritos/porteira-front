import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList, lucideTrash2, lucidePencil, lucideChevronRight } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { IManejo, TipoManejo } from '../../../shared/interfaces/IManejo';
import { ITalhao } from '../../../shared/interfaces/ITalhao';
import { NovoManejo } from '../novo-manejo/novo-manejo';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { ManejoService } from '../../../core/services/safra/manejo-service';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-manejos-tab',
  imports: [
    CommonModule,
    HlmPaginationImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmLabelImports,
    HlmCollapsibleImports,
    NgIcon,
    DatePipe
  ],
  providers: [provideIcons({ lucideClipboardList, lucidePencil, lucideTrash2, lucideChevronRight })],
  styleUrl: './manejos-tab.css',
  templateUrl: './manejos-tab.html',
})
export class ManejosTab implements OnInit {
  private manejoService = inject(ManejoService);
  private talhaoService = inject(TalhaoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  safraId = input.required<number>();

  talhoes = signal<ITalhao[]>([]);
  talhaoSelecionadoId = signal<number | null>(null);

  manejos = signal<IManejo[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);
  expandidos = signal<Set<number>>(new Set());

  readonly formatarValor = (valor: number) => moeda.format(valor);

  itemToStringTalhao = (value: number | null | undefined) =>
    this.talhoes().find((t) => t.id === value)?.nome || '';

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
    this.talhaoService.listarTodosPorSafra(this.safraId()).subscribe((res) => {
      this.talhoes.set(res);
    });
  }

  onTalhaoChange(talhaoId: number | null | undefined) {
    if (talhaoId) {
      this.talhaoSelecionadoId.set(talhaoId);
      this.paginaAtual.set(0);
      this.carregar();
    } else {
      this.talhaoSelecionadoId.set(null);
      this.manejos.set([]);
      this.totalPaginas.set(0);
      this.expandidos.set(new Set());
    }
  }

  carregar() {
    const talhaoId = this.talhaoSelecionadoId();
    if (talhaoId == null) return;

    this.carregando.set(true);
    this.expandidos.set(new Set());
    this.manejoService.buscarPorTalhao(talhaoId, this.paginaAtual(), 10).subscribe({
      next: (res) => {
        this.manejos.set(res.content);
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

  estaExpandido(id: number): boolean {
    return this.expandidos().has(id);
  }

  onExpandedChange(id: number, expandido: boolean): void {
    const novo = new Set(this.expandidos());
    if (expandido) novo.add(id);
    else novo.delete(id);
    this.expandidos.set(novo);
  }

  abrirNovoManejo() {
    const talhaoId = this.talhaoSelecionadoId();
    if (talhaoId == null) return;

    const dialogRef = this.dialogService.open(NovoManejo, {
      context: { talhaoId, safraId: this.safraId() },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((manejoCriado) => {
      if (manejoCriado) {
        this.carregar();
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

  editar(manejo: IManejo) {
    const talhaoId = this.talhaoSelecionadoId();
    if (talhaoId == null) return;

    const dialogRef = this.dialogService.open(NovoManejo, {
      context: { talhaoId, safraId: this.safraId(), manejo },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((manejoAtualizado) => {
      if (manejoAtualizado) {
        this.carregar();
      }
    });
  }

  excluir(manejo: IManejo) {
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
          },
          error: () => {
            this.toastService.showSuccess('Erro', 'Não foi possível excluir o manejo');
          },
        });
      }
    });
  }

  produtosResumo(manejo: IManejo): string {
    return manejo.itens.map((i) => `${i.produtoNome} (${i.quantidade})`).join(', ');
  }
}