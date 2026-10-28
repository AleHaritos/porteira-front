import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRightLeft, lucideCoins, lucideHistory, lucideListPlus, lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { LoteService } from '../../../core/services/animais/lote-service';
import { PiqueteService } from '../../../core/services/animais/piquete-service';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { IAnimal, TipoAnimal } from '../../../shared/interfaces/IAnimal';
import { ILote } from '../../../shared/interfaces/ILote';
import { IPiquete } from '../../../shared/interfaces/IPiquete';
import { EditarAnimal } from '../editar-animal/editar-animal';
import { HistoricoAnimal } from '../historico-animal/historico-animal';

import { VenderAnimais } from '../vender-animais/vender-animais';
import { TransferirAnimais } from '../transferir-animais/transferir-animais';
import { CadastroLoteAnimais } from '../cadastro-lote-animais/cadastro-lote-animais';
import { CadastroUnicoAnimal } from '../cadastro-unico-animal/cadastro-unico-animal';

@Component({
  selector: 'app-animais-tab',
  imports: [CommonModule, HlmTableImports, HlmButtonImports, HlmPaginationImports, HlmSelectImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideTrash2, lucideCoins, lucideArrowRightLeft, lucidePencil, lucideHistory, lucideListPlus })],
  styleUrl: './animais-tab.css',
  templateUrl: './animais-tab.html',
})
export class AnimaisTab implements OnInit {
  fazendaId = input.required<number>();
  piqueteFixo = input<number | undefined>();

  private animalService = inject(AnimalService);
  private piqueteService = inject(PiqueteService);
  private loteService = inject(LoteService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  animais = signal<IAnimal[]>([]);
  piquetes = signal<IPiquete[]>([]);
  lotes = signal<ILote[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  selecionados = signal<Set<number>>(new Set());

  filtroPiqueteId = signal<number | null>(null);
  filtroLoteId = signal<number | null>(null);
  filtroTipo = signal<TipoAnimal | null>(null);

  tipoOptions: { value: TipoAnimal; label: string }[] = [
    { value: 'GADO', label: 'Gado' },
    { value: 'BEZERRO', label: 'Bezerro' },
    { value: 'NOVILHA', label: 'Novilha' },
    { value: 'CAVALO', label: 'Cavalo' },
    { value: 'PORCO', label: 'Porco' },
    { value: 'GALINHA', label: 'Galinha' },
    { value: 'OUTRO', label: 'Outro' },
  ];

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
  itemToStringPiquete = (id: number | null | undefined) =>
    this.piquetes().find((p) => p.id === id)?.nome ?? 'Todos os piquetes';

  itemToStringLote = (id: number | null | undefined) =>
    this.lotes().find((l) => l.id === id)?.nome ?? 'Todos os lotes';

  itemToStringTipo = (value: TipoAnimal | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label ?? 'Todos os tipos';

  get todosDaPaginaSelecionados(): boolean {
    return this.animais().length > 0 && this.animais().every((a) => this.selecionados().has(a.id));
  }

  ngOnInit(): void {
    if (this.piqueteFixo()) {
      this.filtroPiqueteId.set(this.piqueteFixo()!);
    }

    this.piqueteService.listarPorFazenda(this.fazendaId()).subscribe({ next: (res) => this.piquetes.set(res) });
    this.loteService.listarPorFazenda(this.fazendaId()).subscribe({ next: (res) => this.lotes.set(res) });
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.animalService
      .listarPorFazenda(this.fazendaId(), this.filtroPiqueteId(), this.filtroLoteId(), this.filtroTipo(), this.paginaAtual(), 10)
      .subscribe({
        next: (res) => {
          this.animais.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar os animais');
        },
      });
  }

  onFiltroPiqueteChange(id: number | null | undefined): void {
    this.filtroPiqueteId.set(id ?? null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  onFiltroLoteChange(id: number | null | undefined): void {
    this.filtroLoteId.set(id ?? null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  onFiltroTipoChange(tipo: TipoAnimal | null | undefined): void {
    this.filtroTipo.set(tipo ?? null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  tipoLabel(tipo: TipoAnimal): string {
    return this.tipoOptions.find((o) => o.value === tipo)?.label ?? tipo;
  }

  toggleSelecionado(id: number): void {
    const novo = new Set(this.selecionados());
    if (novo.has(id)) {
      novo.delete(id);
    } else {
      novo.add(id);
    }
    this.selecionados.set(novo);
  }

  toggleSelecionarTodos(): void {
    const novo = new Set(this.selecionados());
    if (this.todosDaPaginaSelecionados) {
      this.animais().forEach((a) => novo.delete(a.id));
    } else {
      this.animais().forEach((a) => novo.add(a.id));
    }
    this.selecionados.set(novo);
  }

  limparSelecao(): void {
    this.selecionados.set(new Set());
  }

  abrirCadastroUnico(): void {
    const dialogRef = this.dialogService.open(CadastroUnicoAnimal, {
      context: {
        fazendaId: this.fazendaId(),
        piqueteFixo: this.piqueteFixo() ?? null,
        piquetes: this.piquetes(),
        lotes: this.lotes(),
      },
      contentClass: 'sm:!max-w-[720px], sm:!min-w-[600px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  abrirCadastroLote(): void {
    const dialogRef = this.dialogService.open(CadastroLoteAnimais, {
      context: {
        fazendaId: this.fazendaId(),
        piqueteFixo: this.piqueteFixo() ?? null,
        piquetes: this.piquetes(),
        lotes: this.lotes(),
      },
      contentClass: 'sm:!max-w-[820px], sm:!min-w-[700px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  abrirVenda(): void {
    const animaisSelecionados = this.animais().filter((a) => this.selecionados().has(a.id));
    if (animaisSelecionados.length === 0) return;

    const dialogRef = this.dialogService.open(VenderAnimais, {
      context: { fazendaId: this.fazendaId(), animais: animaisSelecionados },
      contentClass: 'sm:!max-w-[640px], sm:!min-w-[520px]',
    });

    dialogRef.closed$.subscribe((vendido) => {
      if (vendido) {
        this.limparSelecao();
        this.carregar();
      }
    });
  }

  abrirTransferencia(): void {
    const animaisSelecionados = this.animais().filter((a) => this.selecionados().has(a.id));
    if (animaisSelecionados.length === 0) return;

    const dialogRef = this.dialogService.open(TransferirAnimais, {
      context: { fazendaId: this.fazendaId(), animais: animaisSelecionados, piquetes: this.piquetes() },
      contentClass: 'sm:!max-w-[480px]',
    });

    dialogRef.closed$.subscribe((transferido) => {
      if (transferido) {
        this.limparSelecao();
        this.carregar();
      }
    });
  }

  abrirEdicao(animal: IAnimal): void {
    const dialogRef = this.dialogService.open(EditarAnimal, {
      context: { animal, fazendaId: this.fazendaId(), lotes: this.lotes(), tipoOptions: this.tipoOptions },
      contentClass: 'sm:!max-w-[640px], sm:!min-w-[520px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  abrirHistorico(animal: IAnimal): void {
    this.dialogService.open(HistoricoAnimal, {
      context: { animal },
      contentClass: 'sm:!max-w-[560px]',
    });
  }

  excluir(animal: IAnimal): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir animal',
        mensagem: `Tem certeza que deseja excluir este animal (${this.tipoLabel(animal.tipo)})? Essa ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.animalService.excluir(animal.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Animal excluído com sucesso!');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível excluir o animal'),
        });
      }
    });
  }
}