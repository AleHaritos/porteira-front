import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideListPlus, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { LoteService } from '../../../core/services/animais/lote-service';
import { PiqueteService } from '../../../core/services/animais/piquete-service';
import { ToastService } from '../../../core/services/toast-service';
import { IAnimal, SexoAnimal, TipoAnimal } from '../../../shared/interfaces/IAnimal';
import { ILote } from '../../../shared/interfaces/ILote';
import { IPiquete } from '../../../shared/interfaces/IPiquete';
import { CadastroLoteAnimais } from '../cadastro-lote-animais/cadastro-lote-animais';
import { CadastroUnicoAnimal } from '../cadastro-unico-animal/cadastro-unico-animal';

@Component({
  selector: 'app-todos-animais-tab',
  imports: [CommonModule, HlmTableImports, HlmPaginationImports, HlmSelectImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideListPlus })],
  styleUrl: './todos-animais-tab.css',
  templateUrl: './todos-animais-tab.html',
})
export class TodosAnimaisTab implements OnInit {
  fazendaId = input.required<number>();

  private animalService = inject(AnimalService);
  private piqueteService = inject(PiqueteService);
  private loteService = inject(LoteService);
  private toastService = inject(ToastService);
  private dialogService = inject(HlmDialogService);

  animais = signal<IAnimal[]>([]);
  piquetes = signal<IPiquete[]>([]);
  lotes = signal<ILote[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

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

  ngOnInit(): void {
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

  sexoLabel(sexo: SexoAnimal | null): string {
    if (sexo === 'MACHO') return 'Macho';
    if (sexo === 'FEMEA') return 'Fêmea';
    return '-';
  }

  formatarData(data: string | null): string {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  abrirCadastroUnico(): void {
    const dialogRef = this.dialogService.open(CadastroUnicoAnimal, {
      context: {
        fazendaId: this.fazendaId(),
        piqueteFixo: null,
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
        piqueteFixo: null,
        piquetes: this.piquetes(),
        lotes: this.lotes(),
      },
      contentClass: 'sm:!max-w-[820px], sm:!min-w-[700px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }
}