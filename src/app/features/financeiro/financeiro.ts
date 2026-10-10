import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucidePencil,
  lucideTrash2,
  lucideTrendingUp,
  lucideTrendingDown,
  lucideSearch,
  lucideTriangleAlert,
  lucideChartColumn,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { TransacoesService } from '../../core/services/transacoes-service';
import { ToastService } from '../../core/services/toast-service';
import { ITransacao, TipoTransacao, ResumoFinanceiro } from '../../shared/interfaces/ITransacao';
import { NovaTransacao } from './nova-transacao/nova-transacao';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { TruncarPipe } from '../../shared/pipes/TruncarPipe';

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

const GRAFICO_ALTURA_MAXIMA = 150;
const GRAFICO_LARGURA_BARRA = 64;
const GRAFICO_ESPACO_ENTRE = 48;
const GRAFICO_BASELINE = 170;

@Component({
  selector: 'app-financeiro',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmTableImports,
    HlmPaginationImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmDatePickerImports,
    HlmLabelImports,
    NgIcon,
    DatePipe,
    TruncarPipe,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucidePencil,
      lucideTrash2,
      lucideTrendingUp,
      lucideTrendingDown,
      lucideSearch,
      lucideTriangleAlert,
      lucideChartColumn,
    }),
  ],
  styleUrl: './financeiro.css',
  templateUrl: './financeiro.html',
})

export class Financeiro implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private transacoesService = inject(TransacoesService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  transacoes = signal<ITransacao[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  resumo = signal<ResumoFinanceiro>({ totalReceitas: 0, totalGastos: 0, saldo: 0 });

  tipoFiltro = signal<TipoTransacao | 'TODOS'>('TODOS');
  maxDate = new Date();

  readonly baselineGrafico = GRAFICO_BASELINE;

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

  filtroForm = this.fb.group({
    dataInicio: [null as Date | null],
    dataFim: [null as Date | null],
  });

  tipoFiltroOptions: { value: TipoTransacao | null; label: string }[] = [
    { value: null, label: 'Todos' },
    { value: 'RECEITA', label: 'Receita' },
    { value: 'GASTO', label: 'Gasto' },
  ];

  itemToStringTipoFiltro = (value: TipoTransacao | 'TODOS' | null | undefined) =>
    this.tipoFiltroOptions.find((o) => o.value === value)?.label || 'Todos';

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
      this.carregarResumo();
    });
  }

  onTipoFiltroChange(tipo: TipoTransacao | 'TODOS' | null | undefined) {
    this.tipoFiltro.set(tipo ?? 'TODOS');
  }

  pesquisar() {
    this.paginaAtual.set(0);
    this.carregar();
    this.carregarResumo();
  }

  limparFiltros() {
    this.tipoFiltro.set('TODOS');
    this.filtroForm.reset({ dataInicio: null, dataFim: null });
    this.paginaAtual.set(0);
    this.carregar();
    this.carregarResumo();
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

  carregar() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;
    const tipo = this.tipoFiltro();

    this.carregando.set(true);
    this.transacoesService
      .buscarPorFazenda(
        fazendaId,
        this.paginaAtual(),
        6,
        dataInicio ? this.formatarDataIso(dataInicio) : null,
        dataFim ? this.formatarDataIso(dataFim) : null,
        tipo === 'TODOS' ? null : tipo,
      )
      .subscribe({
        next: (res) => {
          this.transacoes.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar as transações');
        },
      });
  }

  carregarResumo() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;
    const inicio = dataInicio ? this.formatarDataIso(dataInicio) : this.primeiroDiaDoMes();
    const fim = dataFim ? this.formatarDataIso(dataFim) : this.ultimoDiaDoMes();

    this.transacoesService.buscarResumo(fazendaId, inicio, fim).subscribe({
      next: (res) => this.resumo.set(res),
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar o resumo financeiro'),
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovaTransacao() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaTransacao, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((criada) => {
      if (criada) {
        this.carregar();
        this.carregarResumo();
      }
    });
  }

  editar(transacao: ITransacao) {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaTransacao, {
      context: { fazendaId, transacao },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((atualizada) => {
      if (atualizada) {
        this.carregar();
        this.carregarResumo();
      }
    });
  }

  excluir(transacao: ITransacao) {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir transação',
        mensagem: `Tem certeza que deseja excluir a transação "${transacao.descricao || this.tipoLabel(transacao.tipo)}"? Essa ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.transacoesService.desativar(transacao.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Transação excluída com sucesso!');
            this.carregar();
            this.carregarResumo();
          },
          error: () => {
            this.toastService.showError('Erro', 'Não foi possível excluir a transação');
          },
        });
      }
    });
  }

  tipoOptions: { value: TipoTransacao; label: string }[] = [
    { value: 'RECEITA', label: 'Receita' },
    { value: 'GASTO', label: 'Gasto' },
  ];

  tipoClasse(tipo: string): string {
    const classes: Record<string, string> = {
      RECEITA: 'fazenda-table__badge--receita',
      GASTO: 'fazenda-table__badge--gasto',
    };
    return classes[tipo] || '';
  }

  tipoLabel(tipo: string): string {
    return this.tipoOptions.find((o) => o.value === tipo)?.label || tipo;
  }

  vinculo(transacao: ITransacao): string {
    return transacao.negocioNome ?? transacao.safraNome ?? '-';
  }

  valorClasse(tipo: string): string {
    return tipo === 'RECEITA' ? 'financeiro-table__valor--receita' : 'financeiro-table__valor--gasto';
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

}