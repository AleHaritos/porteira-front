import { Component, EventEmitter, Input, OnChanges, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrendingUp, lucideTrendingDown, lucideTriangleAlert, lucideChartColumn, lucideSearch, lucideFileDown } from '@ng-icons/lucide';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ITransacao } from '../../../shared/interfaces/ITransacao';
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
import { IProjeto } from '../../../shared/interfaces/IProjeto';
import { TruncarPipe } from '../../../shared/pipes/TruncarPipe';
import { ProjetoService } from '../../../core/services/projeto/projeto-service';

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

type VinculoFiltro = 'TODOS' | 'NEGOCIO' | 'SAFRA' | 'PROJETO';
type TipoFiltro = 'TODOS' | 'RECEITA' | 'GASTO';

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
    provideIcons({ lucideTrendingUp, lucideTrendingDown, lucideTriangleAlert, lucideChartColumn, lucideSearch, lucideFileDown }),
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
  private projetoService = inject(ProjetoService);
  private toastService = inject(ToastService);

  maxDate = new Date();
  resumo = signal<ResumoFinanceiro>({ totalReceitas: 0, totalGastos: 0, saldo: 0 });

  contasPagar = signal<IParcelaContaPendente[]>([]);
  contasPagarTotal = signal(0);
  contasReceber = signal<IParcelaContaPendente[]>([]);
  contasReceberTotal = signal(0);

  readonly baselineGrafico = GRAFICO_BASELINE;
  exportandoPdf = signal(false);

  vinculoFiltro = signal<VinculoFiltro>('TODOS');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  projetos = signal<IProjeto[]>([]);
  negocioFiltroId = signal<number | null>(null);
  safraFiltroId = signal<number | null>(null);
  projetoFiltroId = signal<number | null>(null);

  tipoFiltro = signal<TipoFiltro>('TODOS');

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  itemToStringProjeto = (value: number | null | undefined) =>
    this.projetos().find((p) => p.id === value)?.nome || '';

  filtroForm = this.fb.group({
    dataInicio: [null as Date | null],
    dataFim: [null as Date | null],
  });

  dadosGrafico = computed<ResumoBarraDatum[]>(() => {
    const tipo = this.tipoFiltro();
    const todos: ResumoBarraDatum[] = [
      { chave: 'receitas', label: 'Receitas', valor: this.resumo().totalReceitas, cor: '#2f9e58' },
      { chave: 'gastos', label: 'Gastos', valor: this.resumo().totalGastos, cor: '#c0392b' },
    ];
    if (tipo === 'RECEITA') return todos.filter((d) => d.chave === 'receitas');
    if (tipo === 'GASTO') return todos.filter((d) => d.chave === 'gastos');
    return todos;
  });

  temMovimentacaoVisivel = computed(() => this.dadosGrafico().some((d) => d.valor > 0));

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

    this.projetoService.listarTodosPorFazenda(this.fazendaId).subscribe({
      next: (projetos) => this.projetos.set(projetos),
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
    this.projetoFiltroId.set(null);
  }

  onNegocioFiltroChange(id: number | null | undefined) {
    this.negocioFiltroId.set(id ?? null);
  }

  onSafraFiltroChange(id: number | null | undefined) {
    this.safraFiltroId.set(id ?? null);
  }

  onProjetoFiltroChange(id: number | null | undefined) {
    this.projetoFiltroId.set(id ?? null);
  }

  onTipoFiltroChange(tipo: TipoFiltro) {
    this.tipoFiltro.set(tipo);
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
    this.projetoFiltroId.set(null);
    this.tipoFiltro.set('TODOS');
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
    const projetoId = vinculo === 'PROJETO' ? this.projetoFiltroId() : null;

    this.transacoesService.buscarResumo(this.fazendaId, inicio, fim, negocioId, safraId, projetoId).subscribe({
      next: (res) => this.resumo.set(res),
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar o resumo financeiro'),
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private formatarDataBr(data: Date): string {
    return data.toLocaleDateString('pt-BR');
  }

  exportarPdf(): void {
    if (this.fazendaId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;
    const inicio = dataInicio ? this.formatarDataIso(dataInicio) : this.primeiroDiaDoMes();
    const fim = dataFim ? this.formatarDataIso(dataFim) : this.ultimoDiaDoMes();

    const vinculo = this.vinculoFiltro();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioFiltroId() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraFiltroId() : null;
    const projetoId = vinculo === 'PROJETO' ? this.projetoFiltroId() : null;

    const tipo = this.tipoFiltro();
    const tipoParam = tipo === 'TODOS' ? null : tipo;

    this.exportandoPdf.set(true);

    this.transacoesService.listarComFiltros(this.fazendaId, inicio, fim, tipoParam, negocioId, safraId, projetoId).subscribe({
      next: (transacoes) => {
        this.gerarPdf(transacoes, inicio, fim);
        this.exportandoPdf.set(false);
      },
      error: () => {
        this.exportandoPdf.set(false);
        this.toastService.showError('Erro', 'Não foi possível gerar o PDF');
      },
    });
  }

  private parseDataIso(iso: string): Date {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  private gerarPdf(transacoes: ITransacao[], inicioIso: string, fimIso: string): void {
    const doc = new jsPDF();
    const larguraPagina = doc.internal.pageSize.getWidth();
    const margem = 14;
    let y: number;

    // ---- faixa de cabeçalho ----
    doc.setFillColor(47, 158, 88);
    doc.rect(0, 0, larguraPagina, 28, 'F');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Relatório Financeiro', margem, 17);

    doc.setFontSize(9);
    doc.setTextColor(230, 245, 235);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`, margem, 24);

    y = 38;

    // ---- filtros ----
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    const inicioTexto = this.formatarDataBr(this.parseDataIso(inicioIso));
    const fimTexto = this.formatarDataBr(this.parseDataIso(fimIso));
    doc.text(`Período: ${inicioTexto} até ${fimTexto}`, margem, y);

    const vinculo = this.vinculoFiltro();
    let vinculoTexto = 'Vínculo: Todos';
    if (vinculo === 'NEGOCIO') {
      vinculoTexto = `Vínculo: Negócio - ${this.itemToStringNegocio(this.negocioFiltroId()) || '-'}`;
    } else if (vinculo === 'SAFRA') {
      vinculoTexto = `Vínculo: Safra - ${this.itemToStringSafra(this.safraFiltroId()) || '-'}`;
    } else if (vinculo === 'PROJETO') {
      vinculoTexto = `Vínculo: Projeto - ${this.itemToStringProjeto(this.projetoFiltroId()) || '-'}`;
    }

    const tipo = this.tipoFiltro();
    let tipoTexto = '';
    if (tipo === 'RECEITA') tipoTexto = ' | Tipo: Receitas';
    else if (tipo === 'GASTO') tipoTexto = ' | Tipo: Gastos';

    doc.text(vinculoTexto + tipoTexto, larguraPagina - margem, y, { align: 'right' });

    y += 10;

    // ---- cards de resumo ----
    const resumo = this.resumo();

    const cards: { label: string; valor: number; corFundo: [number, number, number]; corTexto: [number, number, number] }[] = [];
    if (tipo !== 'GASTO') {
      cards.push({ label: 'Receitas', valor: resumo.totalReceitas, corFundo: [227, 245, 232], corTexto: [39, 138, 76] });
    }
    if (tipo !== 'RECEITA') {
      cards.push({ label: 'Gastos', valor: resumo.totalGastos, corFundo: [253, 232, 232], corTexto: [192, 57, 43] });
    }
    if (tipo === 'TODOS') {
      cards.push({
        label: 'Saldo',
        valor: resumo.saldo,
        corFundo: resumo.saldo >= 0 ? [227, 245, 232] : [253, 232, 232],
        corTexto: resumo.saldo >= 0 ? [39, 138, 76] : [192, 57, 43],
      });
    }

    const cardLargura = (larguraPagina - margem * 2 - 10 * (cards.length - 1)) / cards.length;
    const cardAltura = 22;

    cards.forEach((card, i) => {
      const x = margem + i * (cardLargura + 10);
      doc.setFillColor(card.corFundo[0], card.corFundo[1], card.corFundo[2]);
      doc.roundedRect(x, y, cardLargura, cardAltura, 2, 2, 'F');

      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(card.label, x + 4, y + 8);

      doc.setFontSize(12);
      doc.setTextColor(card.corTexto[0], card.corTexto[1], card.corTexto[2]);
      doc.text(this.formatarValor(card.valor), x + 4, y + 17);
    });

    y += cardAltura + 14;

    // ---- gráfico ----
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    const tituloGrafico = tipo === 'RECEITA' ? 'Receitas' : tipo === 'GASTO' ? 'Gastos' : 'Receitas x Gastos';
    doc.text(tituloGrafico, margem, y);
    y += 6;

    const alturaMaxima = 40;
    const larguraBarra = 26;
    const espacoBarras = 18;
    const baseline = y + alturaMaxima;
    const maxValor = Math.max(resumo.totalReceitas, resumo.totalGastos, 1);

    const barras: { label: string; valor: number; cor: [number, number, number] }[] = [];
    if (tipo !== 'GASTO') barras.push({ label: 'Receitas', valor: resumo.totalReceitas, cor: [47, 158, 88] });
    if (tipo !== 'RECEITA') barras.push({ label: 'Gastos', valor: resumo.totalGastos, cor: [192, 57, 43] });

    barras.forEach((barra, i) => {
      const altura = (barra.valor / maxValor) * alturaMaxima;
      const x = margem + i * (larguraBarra + espacoBarras);
      const yTopo = baseline - altura;

      doc.setFillColor(barra.cor[0], barra.cor[1], barra.cor[2]);
      doc.roundedRect(x, yTopo, larguraBarra, altura, 1.5, 1.5, 'F');

      doc.setFontSize(8);
      doc.setTextColor(31, 41, 55);
      doc.text(this.formatarValor(barra.valor), x, yTopo - 2);
      doc.text(barra.label, x, baseline + 5);
    });

    doc.setDrawColor(229, 231, 235);
    doc.line(margem, baseline, larguraPagina - margem, baseline);

    y = baseline + 16;

    // ---- tabela de transações ----
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(`Transações do Período (${transacoes.length})`, margem, y);

    const linhas = transacoes.map((t) => [
      this.formatarDataBr(this.parseDataIso(t.data)),
      t.tipo === 'RECEITA' ? 'Receita' : 'Gasto',
      t.descricao || '-',
      t.negocioNome ?? t.safraNome ?? t.projetoNome ?? '-',
      this.formatarValor(t.valor),
    ]);

    autoTable(doc, {
      startY: y + 4,
      head: [['Data', 'Tipo', 'Descrição', 'Vínculo', 'Valor']],
      body: linhas,
      margin: { left: margem, right: margem },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [232, 245, 236], textColor: [39, 138, 76], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [251, 254, 252] },
      columnStyles: { 4: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const tipoLinha = linhas[data.row.index][1];
          data.cell.styles.textColor = tipoLinha === 'Receita' ? [39, 138, 76] : [192, 57, 43];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    doc.save(`relatorio-financeiro-${this.formatarDataIso(new Date())}.pdf`);
  }
}