import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalculator,
  lucideFileDown,
  lucideSearch,
  lucideTrendingDown,
  lucideTrendingUp,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CustoCategoriaSafraService } from '../../../core/services/safra/custo-categoria-safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { TransacoesService } from '../../../core/services/transacoes-service';
import { ICustosCombustivelManutencao } from '../../../shared/interfaces/ICustosCombustivelManutencao';
import { ITransacao, ResumoFinanceiro } from '../../../shared/interfaces/ITransacao';
import { TruncarPipe } from '../../../shared/pipes/TruncarPipe';
import { SafraResumoTalhoes } from '../safra-resumo-talhoes/safra-resumo-talhoes';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type AbaResumo = 'safra' | 'talhoes';

@Component({
  selector: 'app-safra-resumo',
  imports: [
    NgClass,
    DatePipe,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmDatePickerImports,
    HlmLabelImports,
    HlmTableImports,
    HlmPaginationImports,
    NgIcon,
    TruncarPipe,
    SafraResumoTalhoes,
    HlmTabsImports
  ],
  providers: [
    provideIcons({ lucideCalculator, lucideSearch, lucideTrendingUp, lucideTrendingDown, lucideFileDown }),
  ],
  styleUrl: './safra-resumo.css',
  templateUrl: './safra-resumo.html',
})
export class SafraResumo implements OnInit {
  safraId = input.required<number>();
  fazendaId = input.required<number>();
  abaAtiva = signal<AbaResumo>('safra');

  private fb = inject(FormBuilder);
  private transacoesService = inject(TransacoesService);
  private custoCategoriaSafraService = inject(CustoCategoriaSafraService);
  private toastService = inject(ToastService);

  maxDate = new Date();

  filtroForm = this.fb.group({
    dataInicio: [this.primeiroDiaDoMes() as Date | null],
    dataFim: [new Date() as Date | null],
  });

  private filtroAplicado: { inicio: string | null; fim: string | null } = { inicio: null, fim: null };

  resumoFinanceiro = signal<ResumoFinanceiro | null>(null);
  resumoCarregado = signal(false);
  custosCategoria = signal<ICustosCombustivelManutencao | null>(null);

  transacoes = signal<ITransacao[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregandoTransacoes = signal(false);

  exportandoPdf = signal(false);

  totalCustos = computed(() => this.resumoFinanceiro()?.totalGastos ?? 0);
  totalReceitas = computed(() => this.resumoFinanceiro()?.totalReceitas ?? 0);
  lucro = computed(() => this.resumoFinanceiro()?.saldo ?? 0);

  totalAbastecimento = computed(() => this.custosCategoria()?.totalCombustivel ?? 0);
  totalManutencao = computed(() => this.custosCategoria()?.totalManutencao ?? 0);

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

  readonly formatarValor = (valor: number) => moeda.format(valor);

  ngOnInit(): void {
    this.pesquisar();
  }

  selecionarAba(aba: AbaResumo): void {
    this.abaAtiva.set(aba);
  }

  private paraIso(data: Date | null | undefined): string | null {
    if (!data) return null;
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

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  pesquisar(): void {
    const { dataInicio, dataFim } = this.filtroForm.value;
    const inicio = this.paraIso(dataInicio);
    const fim = this.paraIso(dataFim);

    this.filtroAplicado = { inicio, fim };

    this.transacoesService.buscarResumoPorSafra(this.safraId(), inicio, fim).subscribe({
      next: (resumo) => {
        this.resumoFinanceiro.set(resumo);
        this.resumoCarregado.set(true);
      },
      error: () => {
        this.resumoCarregado.set(true);
        this.toastService.showError('Erro', 'Não foi possível carregar o resumo da safra');
      },
    });

    this.custoCategoriaSafraService.buscar(this.safraId(), inicio, fim).subscribe({
      next: (dados) => this.custosCategoria.set(dados),
    });

    this.paginaAtual.set(0);
    this.carregarTransacoes();
  }

  limpar(): void {
    this.filtroForm.reset();
    this.pesquisar();
  }

  carregarTransacoes(): void {
    const { inicio, fim } = this.filtroAplicado;

    this.carregandoTransacoes.set(true);
    this.transacoesService
      .buscarPorFazenda(this.fazendaId(), this.paginaAtual(), 10, inicio, fim, null, null, this.safraId())
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

  exportarPdf(): void {
    if (this.exportandoPdf()) return;

    const { inicio, fim } = this.filtroAplicado;

    this.exportandoPdf.set(true);

    this.transacoesService.listarComFiltros(this.fazendaId(), inicio, fim, null, null, this.safraId()).subscribe({
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
    doc.text('Relatório da Safra', margem, 17);

    doc.setFontSize(9);
    doc.setTextColor(230, 245, 235);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`,
      margem,
      24,
    );

    y = 38;

    const filtrado = !!(inicioIso || fimIso);
    const inicioTexto = inicioIso ? this.formatarDataBr(this.parseDataIso(inicioIso)) : '-';
    const fimTexto = fimIso ? this.formatarDataBr(this.parseDataIso(fimIso)) : '-';

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(filtrado ? `Período: ${inicioTexto} até ${fimTexto}` : 'Período: toda a safra', margem, y);

    y += 10;

    const resumo = this.resumoFinanceiro() ?? { totalReceitas: 0, totalGastos: 0, saldo: 0 };

    const cards: {
      label: string;
      valor: number;
      corFundo: [number, number, number];
      corTexto: [number, number, number];
    }[] = [
        { label: 'Receitas', valor: resumo.totalReceitas, corFundo: [227, 245, 232], corTexto: [39, 138, 76] },
        { label: 'Gastos', valor: resumo.totalGastos, corFundo: [253, 232, 232], corTexto: [192, 57, 43] },
        {
          label: 'Lucro',
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

    y += cardAltura + 8;

    const textoReferencia =
      `Abastecimento: ${this.formatarValor(this.totalAbastecimento())}   |   ` +
      `Manutenção: ${this.formatarValor(this.totalManutencao())}   (já incluídos nos gastos)`;
    const linhasReferencia = doc.splitTextToSize(textoReferencia, larguraPagina - margem * 2);

    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text(linhasReferencia, margem, y);

    y += linhasReferencia.length * 4 + 8;

    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(`${filtrado ? 'Transações do Período' : 'Transações da Safra'} (${transacoes.length})`, margem, y);

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

    doc.save(`relatorio-safra-${this.paraIso(new Date())}.pdf`);
  }
}