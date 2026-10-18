import { Component, EventEmitter, Input, OnChanges, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrendingUp, lucideTrendingDown, lucideTriangleAlert, lucideChartColumn, lucideSearch } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { ContasPendentesService } from '../../../core/services/contas-pendentes-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { TransacoesService } from '../../../core/services/transacoes-service';
import { ToastService } from '../../../core/services/toast-service';
import { ResumoFinanceiro } from '../../../shared/interfaces/ITransacao';
import { IParcelaContaPendente } from '../../../shared/interfaces/IContaPendente';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { TruncarPipe } from '../../../shared/pipes/TruncarPipe';

interface ResumoBarraDatum {
  chave: 'receitas' | 'gastos';
  label: string;
  valor: number;
  cor: string;
}

interface ResumoBarraGeometria extends ResumoBarraDatum {
  valorFormatado: string;
  x: number;
  width: number;
  height: number;
  y: number;
}

type VinculoFiltro = 'TODOS' | 'NEGOCIO' | 'SAFRA';

const GRAFICO_ALTURA_MAXIMA = 150;
const GRAFICO_LARGURA_BARRA = 64;
const GRAFICO_ESPACO_ENTRE = 48;
const GRAFICO_BASELINE = 170;

@Component({
  selector: 'app-financeiro-resumo-tab',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmDatePickerImports,
    HlmLabelImports,
    HlmSelectImports,
    NgIcon,
    DatePipe,
    TruncarPipe,
  ],
  providers: [
    provideIcons({ lucideTrendingUp, lucideTrendingDown, lucideTriangleAlert, lucideChartColumn, lucideSearch }),
  ],
  styleUrl: './financeiro-resumo-tab.css',
  templateUrl: './financeiro-resumo-tab.html',
})
export class FinanceiroResumoTab implements OnInit, OnChanges {
  @Input({ required: true }) fazendaId!: number;
  @Output() abrirContasPendentes = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private transacoesService = inject(TransacoesService);
  private contasPendentesService = inject(ContasPendentesService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private toastService = inject(ToastService);

  maxDate = new Date();
  resumo = signal<ResumoFinanceiro>({ totalReceitas: 0, totalGastos: 0, saldo: 0 });

  contasPagar = signal<IParcelaContaPendente[]>([]);
  contasPagarTotal = signal(0);
  contasReceber = signal<IParcelaContaPendente[]>([]);
  contasReceberTotal = signal(0);

  readonly baselineGrafico = GRAFICO_BASELINE;

  vinculoFiltro = signal<VinculoFiltro>('TODOS');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  negocioFiltroId = signal<number | null>(null);
  safraFiltroId = signal<number | null>(null);

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  filtroForm = this.fb.group({
    dataInicio: [null as Date | null],
    dataFim: [null as Date | null],
  });

  dadosGrafico = computed<ResumoBarraDatum[]>(() => [
    { chave: 'receitas', label: 'Receitas', valor: this.resumo().totalReceitas, cor: '#2f9e58' },
    { chave: 'gastos', label: 'Gastos', valor: this.resumo().totalGastos, cor: '#c0392b' },
  ]);

  geometriaGrafico = computed<ResumoBarraGeometria[]>(() => {
    const dados = this.dadosGrafico();
    const maxValor = Math.max(dados[0]?.valor ?? 0, dados[1]?.valor ?? 0, 1);

    return dados.map((d, i) => {
      const altura = (d.valor / maxValor) * GRAFICO_ALTURA_MAXIMA;
      return {
        ...d,
        valorFormatado: this.formatarValor(d.valor),
        x: i * (GRAFICO_LARGURA_BARRA + GRAFICO_ESPACO_ENTRE) + GRAFICO_ESPACO_ENTRE / 2,
        width: GRAFICO_LARGURA_BARRA,
        height: altura,
        y: GRAFICO_BASELINE - altura,
      };
    });
  });

  larguraViewBoxGrafico = computed(() => {
    const n = this.dadosGrafico().length;
    return n * (GRAFICO_LARGURA_BARRA + GRAFICO_ESPACO_ENTRE) + GRAFICO_ESPACO_ENTRE / 2;
  });

  ngOnInit(): void {
    this.carregarVinculos();
    this.carregarResumo();
    this.carregarContasPendentes();
  }

  ngOnChanges(): void {
    this.carregarVinculos();
    this.carregarResumo();
    this.carregarContasPendentes();
  }

  private carregarVinculos(): void {
    if (this.fazendaId == null) return;

    this.negocioService.listarTodosPorFazenda(this.fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(this.fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });
  }

  private carregarContasPendentes(): void {
    if (this.fazendaId == null) return;

    this.contasPendentesService.buscarParcelasPorFazenda(this.fazendaId, 0, 5, 'PENDENTE', 'GASTO').subscribe({
      next: (res) => {
        this.contasPagar.set(res.content);
        this.contasPagarTotal.set(res.totalElements);
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar as contas a pagar'),
    });

    this.contasPendentesService.buscarParcelasPorFazenda(this.fazendaId, 0, 5, 'PENDENTE', 'RECEITA').subscribe({
      next: (res) => {
        this.contasReceber.set(res.content);
        this.contasReceberTotal.set(res.totalElements);
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar as contas a receber'),
    });
  }

  verTodasPendentes(): void {
    this.abrirContasPendentes.emit();
  }

  onVinculoFiltroChange(vinculo: VinculoFiltro) {
    this.vinculoFiltro.set(vinculo);
    this.negocioFiltroId.set(null);
    this.safraFiltroId.set(null);
  }

  onNegocioFiltroChange(id: number | null | undefined) {
    this.negocioFiltroId.set(id ?? null);
  }

  onSafraFiltroChange(id: number | null | undefined) {
    this.safraFiltroId.set(id ?? null);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private primeiroDiaDoMes(): string {
    const hoje = new Date();
    return this.formatarDataIso(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  }

  private ultimoDiaDoMes(): string {
    const hoje = new Date();
    return this.formatarDataIso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));
  }

  pesquisar() {
    this.carregarResumo();
  }

  limparFiltros() {
    this.filtroForm.reset({ dataInicio: null, dataFim: null });
    this.vinculoFiltro.set('TODOS');
    this.negocioFiltroId.set(null);
    this.safraFiltroId.set(null);
    this.carregarResumo();
  }

  carregarResumo() {
    if (this.fazendaId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;
    const inicio = dataInicio ? this.formatarDataIso(dataInicio) : this.primeiroDiaDoMes();
    const fim = dataFim ? this.formatarDataIso(dataFim) : this.ultimoDiaDoMes();

    const vinculo = this.vinculoFiltro();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioFiltroId() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraFiltroId() : null;

    this.transacoesService.buscarResumo(this.fazendaId, inicio, fim, negocioId, safraId).subscribe({
      next: (res) => this.resumo.set(res),
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar o resumo financeiro'),
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}