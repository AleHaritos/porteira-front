import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideHandCoins, lucideFuel, lucideChevronRight, lucideHistory } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ToastService } from '../../core/services/toast-service';
import { EstoqueCombustivelService } from '../../core/services/veiculos/estoque-combustivel-service';
import { PostoService } from '../../core/services/veiculos/posto-service';
import { TipoCombustivel } from '../../shared/interfaces/IAbastecimento';
import { IEstoqueCombustivel, IReabastecimentoHistorico } from '../../shared/interfaces/IEstoqueCombustivel';
import { IPosto } from '../../shared/interfaces/IPosto';
import { ReabastecerEstoque } from './reabastecer-estoque/reabastecer-estoque';
import { NovoPosto } from './novo-posto/novo-posto';

@Component({
  selector: 'app-postos-estoque',
  imports: [
    CommonModule, ReactiveFormsModule, HlmTableImports, HlmPaginationImports,
    HlmButtonImports, HlmLabelImports, HlmDatePickerImports, NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideHandCoins, lucideFuel, lucideChevronRight, lucideHistory })],
  styleUrl: './postos-estoque.css',
  templateUrl: './postos-estoque.html',
})
export class PostosEstoque implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postoService = inject(PostoService);
  private estoqueCombustivelService = inject(EstoqueCombustivelService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  postos = signal<IPosto[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregandoPostos = signal(false);

  estoques = signal<IEstoqueCombustivel[]>([]);
  carregandoEstoques = signal(false);

  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(null);
  dataFimControl = new FormControl<Date | null>(null);

  historicoDiesel = signal<IReabastecimentoHistorico[]>([]);
  historicoGasolina = signal<IReabastecimentoHistorico[]>([]);
  historicoEtanol = signal<IReabastecimentoHistorico[]>([]);
  carregandoHistorico = signal(false);

  tipoCombustivelLabels: Record<TipoCombustivel, string> = {
    DIESEL: 'Diesel',
    GASOLINA: 'Gasolina',
    ETANOL: 'Etanol',
  };

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
      this.carregarPostos();
      this.carregarEstoques();
      this.carregarHistoricos();
    });

    this.dataInicioControl.valueChanges.subscribe(() => this.carregarHistoricos());
    this.dataFimControl.valueChanges.subscribe(() => this.carregarHistoricos());
  }

  carregarPostos() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregandoPostos.set(true);
    this.postoService.listarPaginado(fazendaId, this.paginaAtual(), 6).subscribe({
      next: (res) => {
        this.postos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregandoPostos.set(false);
      },
      error: () => {
        this.carregandoPostos.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os postos');
      },
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregarPostos();
  }

  carregarEstoques() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregandoEstoques.set(true);
    this.estoqueCombustivelService.listarPorFazenda(fazendaId).subscribe({
      next: (estoques) => {
        this.estoques.set(estoques);
        this.carregandoEstoques.set(false);
      },
      error: () => {
        this.carregandoEstoques.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar o estoque de combustível');
      },
    });
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  carregarHistoricos() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dataInicio = this.dataInicioControl.value;
    const dataFim = this.dataFimControl.value;
    const dataInicioIso = dataInicio ? this.formatarDataIso(dataInicio) : undefined;
    const dataFimIso = dataFim ? this.formatarDataIso(dataFim) : undefined;

    const alvos: { tipo: TipoCombustivel; destino: WritableSignal<IReabastecimentoHistorico[]> }[] = [
      { tipo: 'DIESEL', destino: this.historicoDiesel },
      { tipo: 'GASOLINA', destino: this.historicoGasolina },
      { tipo: 'ETANOL', destino: this.historicoEtanol },
    ];

    this.carregandoHistorico.set(true);
    let pendentes = alvos.length;

    alvos.forEach(({ tipo, destino }) => {
      this.estoqueCombustivelService.listarHistorico(fazendaId, tipo, dataInicioIso, dataFimIso).subscribe({
        next: (historico) => {
          destino.set(historico);
          pendentes--;
          if (pendentes === 0) this.carregandoHistorico.set(false);
        },
        error: () => {
          pendentes--;
          if (pendentes === 0) this.carregandoHistorico.set(false);
          //this.toastService.showError('Erro', `Não foi possível carregar o histórico de ${this.tipoCombustivelLabel(tipo)}`);
        },
      });
    });
  }

  abrirNovoPosto() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoPosto, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[480px]',
    });

    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregarPostos();
    });
  }

  abrirDetalhePosto(posto: IPosto) {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;
    this.router.navigate(['/fazenda', fazendaId, 'posto', posto.id]);
  }

  abrirReabastecerEstoque() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(ReabastecerEstoque, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[520px]',
    });

    dialogRef.closed$.subscribe((reabastecido) => {
      if (reabastecido) {
        this.carregarEstoques();
        this.carregarHistoricos();
      }
    });
  }

  tipoCombustivelLabel(tipo: string): string {
    return this.tipoCombustivelLabels[tipo as TipoCombustivel] || tipo;
  }

  formatarValor(valor: number | null): string {
    if (valor == null) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarLitros(valor: number): string {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  }
}