import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTrendingUp,
  lucideTrendingDown,
  lucideTriangleAlert,
  lucideSearch,
  lucideChartColumn,
  lucideFileDown,
} from '@ng-icons/lucide';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';

import { TransacoesService } from '../../../core/services/transacoes-service';
import { ToastService } from '../../../core/services/toast-service';
import { ITransacao, ResumoFinanceiro } from '../../../shared/interfaces/ITransacao';
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

const GRAFICO_ALTURA_MAXIMA = 150;
const GRAFICO_LARGURA_BARRA = 64;
const GRAFICO_ESPACO_ENTRE = 48;
const GRAFICO_BASELINE = 170;

@Component({
  selector: 'app-negocio-detalhe',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmDatePickerImports,
    HlmLabelImports,
    HlmTableImports,
    HlmPaginationImports,
    NgIcon,
    DatePipe,
    TruncarPipe,
  ],
  providers: [
    provideIcons({ lucideTrendingUp, lucideTrendingDown, lucideTriangleAlert, lucideSearch, lucideChartColumn, lucideFileDown }),
  ],
  styleUrl: './negocio-detalhe.css',
  templateUrl: './negocio-detalhe.html',
})
export class NegocioDetalhe implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private transacoesService = inject(TransacoesService);
  private toastService = inject(ToastService);

  negocioId = signal<number | null>(null);
  fazendaId = signal<number | null>(null);
  maxDate = new Date();

  resumo = signal<ResumoFinanceiro>({ totalReceitas: 0, totalGastos: 0, saldo: 0 });

  transacoes = signal<ITransacao[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregandoTransacoes = signal(false);

  exportandoPdf = signal(false);

  filtroForm = this.fb.group({
    dataInicio: [this.primeiroDiaDoMes() as Date | null],
    dataFim: [new Date() as Date | null],
  });

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
    const fazendaIdParam = this.route.parent?.snapshot.paramMap.get('id');
    this.fazendaId.set(fazendaIdParam ? Number(fazendaIdParam) : null);

    this.route.paramMap.subscribe((params) => {
      const id = params.get('negocioId');
      this.negocioId.set(id ? Number(id) : null);
      this.pesquisar();
    });
  }

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private parseDataIso(iso: string): Date {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  private formatarDataBr(data: Date): string {
    return data.toLocaleDateString('pt-BR');
  }

  pesquisar() {
    const negocioId = this.negocioId();
    if (negocioId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;

    this.transacoesService
      .buscarResumoPorNegocio(
        negocioId,
        dataInicio ? this.formatarDataIso(dataInicio) : null,
        dataFim ? this.formatarDataIso(dataFim) : null,
      )
      .subscribe({
        next: (res) => this.resumo.set(res),
        error: () => this.toastService.showError('Erro', 'Não foi possível carregar o resumo do negócio'),
      });

    this.paginaAtual.set(0);
    this.carregarTransacoes();
  }

  carregarTransacoes(): void {
    const negocioId = this.negocioId();
    const fazendaId = this.fazendaId();
    if (negocioId == null || fazendaId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;

    this.carregandoTransacoes.set(true);
    this.transacoesService
      .buscarPorFazenda(
        fazendaId,
        this.paginaAtual(),
        10,
        dataInicio ? this.formatarDataIso(dataInicio) : null,
        dataFim ? this.formatarDataIso(dataFim) : null,
        null,
        negocioId,
        null,
      )
      .subscribe({
        next: (res) => {
          this.transacoes.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregandoTransacoes.set(false);
        },
        error: () => {
          this.carregandoTransacoes.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar as transações');
        },
      });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregarTransacoes();
  }

  tipoClasse(tipo: string): string {
    return tipo === 'RECEITA' ? 'fazenda-table__badge--receita' : 'fazenda-table__badge--gasto';
  }

  tipoLabel(tipo: string): string {
    return tipo === 'RECEITA' ? 'Receita' : 'Gasto';
  }

  valorClasse(tipo: string): string {
    return tipo === 'RECEITA' ? 'financeiro-table__valor--receita' : 'financeiro-table__valor--gasto';
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  exportarPdf(): void {
    const negocioId = this.negocioId();
    const fazendaId = this.fazendaId();
    if (negocioId == null || fazendaId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;
    const inicio = dataInicio ? this.formatarDataIso(dataInicio) : null;
    const fim = dataFim ? this.formatarDataIso(dataFim) : null;

    this.exportandoPdf.set(true);

    this.transacoesService.listarComFiltros(fazendaId, inicio, fim, null, negocioId, null).subscribe({
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

  private gerarPdf(transacoes: ITransacao[], inicioIso: string | null, fimIso: string | null): void {
    const doc = new jsPDF();
    const larguraPagina = doc.internal.pageSize.getWidth();
    const margem = 14;
    let y: number;

    doc.setFillColor(47, 158, 88);
    doc.rect(0, 0, larguraPagina, 28, 'F');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Relatório do Negócio', margem, 17);

    doc.setFontSize(9);
    doc.setTextColor(230, 245, 235);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`, margem, 24);

    y = 38;

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    const inicioTexto = inicioIso ? this.formatarDataBr(this.parseDataIso(inicioIso)) : '-';
    const fimTexto = fimIso ? this.formatarDataBr(this.parseDataIso(fimIso)) : '-';
    doc.text(`Período: ${inicioTexto} até ${fimTexto}`, margem, y);

    y += 10;

    const resumo = this.resumo();

    const cards: { label: string; valor: number; corFundo: [number, number, number]; corTexto: [number, number, number] }[] = [
      { label: 'Receitas', valor: resumo.totalReceitas, corFundo: [227, 245, 232], corTexto: [39, 138, 76] },
      { label: 'Gastos', valor: resumo.totalGastos, corFundo: [253, 232, 232], corTexto: [192, 57, 43] },
      {
        label: 'Saldo',
        valor: resumo.saldo,
        corFundo: resumo.saldo >= 0 ? [227, 245, 232] : [253, 232, 232],
        corTexto: resumo.saldo >= 0 ? [39, 138, 76] : [192, 57, 43],
      },
    ];

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

    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text('Receitas x Gastos', margem, y);
    y += 6;

    const alturaMaxima = 40;
    const larguraBarra = 26;
    const espacoBarras = 18;
    const baseline = y + alturaMaxima;
    const maxValor = Math.max(resumo.totalReceitas, resumo.totalGastos, 1);

    const barras: { label: string; valor: number; cor: [number, number, number] }[] = [
      { label: 'Receitas', valor: resumo.totalReceitas, cor: [47, 158, 88] },
      { label: 'Gastos', valor: resumo.totalGastos, cor: [192, 57, 43] },
    ];

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

    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(`Transações do Período (${transacoes.length})`, margem, y);

    const linhas = transacoes.map((t) => [
      this.formatarDataBr(this.parseDataIso(t.data)),
      t.tipo === 'RECEITA' ? 'Receita' : 'Gasto',
      t.descricao || '-',
      this.formatarValor(t.valor),
    ]);

    autoTable(doc, {
      startY: y + 4,
      head: [['Data', 'Tipo', 'Descrição', 'Valor']],
      body: linhas,
      margin: { left: margem, right: margem },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [232, 245, 236], textColor: [39, 138, 76], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [251, 254, 252] },
      columnStyles: { 3: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const tipoLinha = linhas[data.row.index][1];
          data.cell.styles.textColor = tipoLinha === 'Receita' ? [39, 138, 76] : [192, 57, 43];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    doc.save(`relatorio-negocio-${this.formatarDataIso(new Date())}.pdf`);
  }
}