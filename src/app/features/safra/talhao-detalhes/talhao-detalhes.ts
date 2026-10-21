import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideLandPlot,
  lucideCalculator,
  lucideWallet,
  lucideFuel,
  lucideWheat,
  lucideFileText,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { TransacoesService } from '../../../core/services/transacoes-service';
import { CustoFixoTalhaoService } from '../../../core/services/safra/custo-fixo-talhao-service';
import { CustoCategoriaSafraService } from '../../../core/services/safra/custo-categoria-safra-service';
import { ColheitaTalhaoService } from '../../../core/services/safra/colheita-talhao-service';
import { ITalhao } from '../../../shared/interfaces/ITalhao';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { ICustoFixoTalhao } from '../../../shared/interfaces/ICustoFixoTalhao';
import { IColheitaTalhao } from '../../../shared/interfaces/IColheitaTalhao';
import { CustoTalhaoCard } from '../custo-talhao-card/custo-talhao-card';
import { ReceitaGastosTalhaoCard } from '../receita-gastos-talhao-card/receita-gastos-talhao-card';
import { CustosFixosTalhaoTab } from '../custos-fixos-talhao-tab/custos-fixos-talhao-tab';
import { ColheitaTalhaoTab } from '../colheita-talhao-tab/colheita-talhao-tab';
import { ICustosCombustivelManutencao } from '../../../shared/interfaces/ICustosCombustivelManutencao';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numeroFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type AbaTalhao = 'resumo' | 'manejos' | 'custosFixos' | 'colheita';

interface ManejoDetalhado {
  label: string;
  valor: number;
}

@Component({
  selector: 'app-talhao-detalhes',
  imports: [
    HlmButtonImports,
    HlmTabsImports,
    NgIcon,
    CustoTalhaoCard,
    ReceitaGastosTalhaoCard,
    CustosFixosTalhaoTab,
    ColheitaTalhaoTab,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideLandPlot,
      lucideCalculator,
      lucideWallet,
      lucideFuel,
      lucideWheat,
      lucideFileText,
    }),
  ],
  styleUrl: './talhao-detalhes.css',
  templateUrl: './talhao-detalhes.html',
})
export class TalhaoDetalhes implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private talhaoService = inject(TalhaoService);
  private safraService = inject(SafraService);
  private transacoesService = inject(TransacoesService);
  private custoFixoTalhaoService = inject(CustoFixoTalhaoService);
  private custoCategoriaSafraService = inject(CustoCategoriaSafraService);
  private colheitaTalhaoService = inject(ColheitaTalhaoService);

  graficoManejoRef = viewChild<ElementRef<HTMLElement>>('graficoManejoWrap');
  graficoReceitaGastosRef = viewChild<ElementRef<HTMLElement>>('graficoReceitaGastosWrap');

  fazendaId!: number;
  safraId!: number;
  talhaoId!: number;

  talhao = signal<ITalhao | null>(null);
  safra = signal<ISafra | null>(null);
  custoTotalSafra = signal<number>(0);
  custosFixos = signal<ICustoFixoTalhao[]>([]);
  custosCombustivelManutencao = signal<ICustosCombustivelManutencao | null>(null);
  colheitas = signal<IColheitaTalhao[]>([]);
  custoManejoTotal = signal(0);
  custoManejoDetalhado = signal<ManejoDetalhado[]>([]);
  carregando = signal(false);
  exportandoPdf = signal(false);

  abaAtiva = signal<AbaTalhao>('resumo');

  proporcaoArea = computed(() => {
    const talhao = this.talhao();
    const safra = this.safra();
    if (!talhao || !safra || !safra.areaTotal) return 0;
    return talhao.areaHectares / safra.areaTotal;
  });

  custoEstimadoTalhao = computed(() => this.custoTotalSafra() * this.proporcaoArea());

  custoPorHectare = computed(() => {
    const talhao = this.talhao();
    if (!talhao || !talhao.areaHectares) return 0;
    return this.custoEstimadoTalhao() / talhao.areaHectares;
  });

  totalCustosFixos = computed(() => this.custosFixos().reduce((soma, c) => soma + c.valor, 0));
  custosFixosPreview = computed(() => this.custosFixos().slice(0, 5));

  custoCombustivelEstimado = computed(
    () => (this.custosCombustivelManutencao()?.totalCombustivel ?? 0) * this.proporcaoArea(),
  );
  custoManutencaoEstimado = computed(
    () => (this.custosCombustivelManutencao()?.totalManutencao ?? 0) * this.proporcaoArea(),
  );

  custoCombustivelPorHa = computed(() => {
    const talhao = this.talhao();
    if (!talhao || !talhao.areaHectares) return 0;
    return this.custoCombustivelEstimado() / talhao.areaHectares;
  });

  custoManutencaoPorHa = computed(() => {
    const talhao = this.talhao();
    if (!talhao || !talhao.areaHectares) return 0;
    return this.custoManutencaoEstimado() / talhao.areaHectares;
  });

  producaoTotalColheita = computed(() => this.colheitas().reduce((soma, c) => soma + c.quantidadeColhida, 0));
  receitaTotalColheita = computed(() =>
    this.colheitas().reduce((soma, c) => soma + c.quantidadeColhida * c.valorUnitario, 0),
  );
  mediaValorColheita = computed(() =>
    this.producaoTotalColheita() ? this.receitaTotalColheita() / this.producaoTotalColheita() : 0,
  );
  producaoPorHaColheita = computed(() => {
    const talhao = this.talhao();
    if (!talhao || !talhao.areaHectares) return 0;
    return this.producaoTotalColheita() / talhao.areaHectares;
  });
  receitaPorHaColheita = computed(() => {
    const talhao = this.talhao();
    if (!talhao || !talhao.areaHectares) return 0;
    return this.receitaTotalColheita() / talhao.areaHectares;
  });

  gastosTotalTalhao = computed(
    () => this.custoEstimadoTalhao() + this.totalCustosFixos() + this.custoManejoTotal(),
  );

  readonly formatarValor = (valor: number) => moeda.format(valor);
  readonly formatarSacas = (valor: number) => `${numeroFormatter.format(valor)} sc`;

  ngOnInit(): void {
    this.fazendaId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.safraId = Number(this.route.snapshot.paramMap.get('safraId'));
    this.talhaoId = Number(this.route.snapshot.paramMap.get('talhaoId'));

    this.carregar();
  }

  recarregarColheitas(): void {
    this.colheitaTalhaoService.listarPorTalhao(this.talhaoId).subscribe({
      next: (colheitas) => this.colheitas.set(colheitas),
    });
  }

  onCustoManejoCalculado(valor: number): void {
    this.custoManejoTotal.set(valor);
  }

  onManejoDetalhadoCalculado(dados: ManejoDetalhado[]): void {
    this.custoManejoDetalhado.set(dados);
  }

  private carregar(): void {
    this.carregando.set(true);

    this.talhaoService.listarTodosPorSafra(this.safraId).subscribe({
      next: (talhoes) => {
        this.talhao.set(talhoes.find((t) => t.id === this.talhaoId) ?? null);
      },
    });

    this.safraService.buscarPorId(this.safraId).subscribe({
      next: (safra) => this.safra.set(safra),
    });

    this.custoFixoTalhaoService.listarPorTalhao(this.talhaoId).subscribe({
      next: (custos) => this.custosFixos.set(custos),
    });

    this.custoCategoriaSafraService.buscar(this.safraId).subscribe({
      next: (dados) => this.custosCombustivelManutencao.set(dados),
    });

    this.colheitaTalhaoService.listarPorTalhao(this.talhaoId).subscribe({
      next: (colheitas) => this.colheitas.set(colheitas),
    });

    this.transacoesService.buscarResumoPorSafra(this.safraId, null, null).subscribe({
      next: (resumo) => {
        this.custoTotalSafra.set(resumo.totalGastos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  selecionarAba(aba: AbaTalhao): void {
    this.abaAtiva.set(aba);
  }

  voltar(): void {
    this.router.navigate(['/fazenda', this.fazendaId, 'safra', this.safraId]);
  }

  async exportarPdf(): Promise<void> {
    if (this.exportandoPdf()) return;
    this.exportandoPdf.set(true);

    const abaAnterior = this.abaAtiva();
    if (abaAnterior !== 'resumo') {
      this.abaAtiva.set('resumo');
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const nomeTalhao = this.talhao()?.nome ?? 'Talhão';
      const areaHectares = this.talhao()?.areaHectares ?? 0;

      const VERDE: [number, number, number] = [39, 138, 76];
      const VERDE_CLARO: [number, number, number] = [227, 245, 232];
      const VERDE_TEXTO: [number, number, number] = [31, 122, 61];
      const VERDE_TABELA: [number, number, number] = [107, 158, 126];
      const LINHA_ALTERNADA: [number, number, number] = [247, 250, 248];
      const TEXTO: [number, number, number] = [31, 41, 55];
      const CINZA: [number, number, number] = [107, 114, 128];
      const BRANCO: [number, number, number] = [255, 255, 255];

      let y = 0;

      doc.setFillColor(...VERDE);
      doc.rect(0, 0, pageWidth, 72, 'F');
      doc.setTextColor(...BRANCO);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(`Resumo do Talhão — ${nomeTalhao}`, margin, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`${areaHectares} ha  ·  Exportado em ${new Date().toLocaleDateString('pt-BR')}`, margin, 60);

      y = 100;

      const garantirEspaco = (alturaNecessaria: number) => {
        if (y + alturaNecessaria > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const addTituloSecao = (titulo: string) => {
        garantirEspaco(30);
        doc.setTextColor(...TEXTO);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text(titulo, margin, y);
        y += 8;
      };

      const addTabela = (
        body: (string | number)[][],
        opcoes?: { head?: string[][]; destaqueApartirDe?: number },
      ) => {
        const numColunas = (opcoes?.head?.[0]?.length ?? body[0]?.length ?? 2) - 1;
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: opcoes?.head,
          body,
          theme: opcoes?.head ? 'striped' : 'plain',
          styles: { fontSize: 10, cellPadding: 5, textColor: TEXTO },
          headStyles: { fillColor: VERDE_TABELA, textColor: BRANCO, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: LINHA_ALTERNADA },
          columnStyles: Object.fromEntries(
            Array.from({ length: numColunas }, (_, i) => [i + 1, { halign: 'right' as const }]),
          ),
          didParseCell: (data) => {
            if (
              opcoes?.destaqueApartirDe !== undefined &&
              !opcoes.head &&
              data.row.index >= opcoes.destaqueApartirDe
            ) {
              data.cell.styles.fillColor = VERDE_CLARO;
              data.cell.styles.textColor = VERDE_TEXTO;
              data.cell.styles.fontStyle = 'bold';
            }
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 20;
      };

      // Rateio geral
      addTituloSecao('Custo Estimado do Talhão (Rateio)');
      addTabela(
        [
          ['Área do talhão', `${areaHectares} ha`],
          ['Área total da safra', `${this.safra()?.areaTotal ?? 0} ha`],
          ['Gastos totais da safra', this.formatarValor(this.custoTotalSafra())],
          ['Custo estimado do talhão', this.formatarValor(this.custoEstimadoTalhao())],
          ['Custo estimado por hectare', this.formatarValor(this.custoPorHectare())],
        ],
        { destaqueApartirDe: 3 },
      );

      // Custos Fixos
      addTituloSecao(`Custos Fixos (${this.custosFixos().length})`);
      if (this.custosFixos().length > 0) {
        addTabela(
          this.custosFixos().map((c) => [c.descricao, this.formatarValor(c.valor)]),
          { head: [['Descrição', 'Valor']] },
        );
      }
      addTabela([['Total de Custos Fixos', this.formatarValor(this.totalCustosFixos())]], {
        destaqueApartirDe: 0,
      });

      // Combustível e Manutenção
      addTituloSecao('Combustível e Manutenção');
      addTabela(
        [
          [
            'Combustível',
            this.formatarValor(this.custosCombustivelManutencao()?.totalCombustivel ?? 0),
            this.formatarValor(this.custoCombustivelEstimado()),
            this.formatarValor(this.custoCombustivelPorHa()),
          ],
          [
            'Manutenção',
            this.formatarValor(this.custosCombustivelManutencao()?.totalManutencao ?? 0),
            this.formatarValor(this.custoManutencaoEstimado()),
            this.formatarValor(this.custoManutencaoPorHa()),
          ],
        ],
        { head: [['Categoria', 'Total Safra', 'Valor Atribuído ao Talhão', 'Por Hectare']] },
      );

      // Colheita
      addTituloSecao(`Colheita (${this.colheitas().length} registro(s))`);
      if (this.colheitas().length > 0) {
        addTabela(
          this.colheitas().map((c) => [
            c.descricao || '—',
            this.formatarSacas(c.quantidadeColhida),
            this.formatarValor(c.valorUnitario),
            this.formatarValor(c.quantidadeColhida * c.valorUnitario),
          ]),
          { head: [['Descrição', 'Quantidade', 'Valor Unitário', 'Receita']] },
        );
      }
      addTabela(
        [
          ['Total de sc', this.formatarSacas(this.producaoTotalColheita())],
          ['Média de valor', this.formatarValor(this.mediaValorColheita())],
          ['Produção por hectare', this.formatarSacas(this.producaoPorHaColheita())],
          ['Receita Total', this.formatarValor(this.receitaTotalColheita())],
          ['Receita por Hectare', this.formatarValor(this.receitaPorHaColheita())],
        ],
        { destaqueApartirDe: 3 },
      );

      // Gráfico de Custo de Manejo
      const elManejo = this.graficoManejoRef()?.nativeElement;
      if (elManejo) {
        addTituloSecao('Custo de Manejo');
        const canvas = await html2canvas(elManejo, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const larguraImg = pageWidth - margin * 2;
        const alturaImg = (canvas.height / canvas.width) * larguraImg;
        garantirEspaco(alturaImg + 10);
        doc.addImage(imgData, 'PNG', margin, y, larguraImg, alturaImg);
        y += alturaImg + 20;
      }

      // Gráfico de Receita x Gastos
      const elReceitaGastos = this.graficoReceitaGastosRef()?.nativeElement;
      if (elReceitaGastos) {
        addTituloSecao('Receita x Gastos');
        const canvas = await html2canvas(elReceitaGastos, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const larguraImg = pageWidth - margin * 2;
        const alturaImg = (canvas.height / canvas.width) * larguraImg;
        garantirEspaco(alturaImg + 10);
        doc.addImage(imgData, 'PNG', margin, y, larguraImg, alturaImg);
        y += alturaImg + 20;
      }

      // Resultado final
      const lucro = this.receitaTotalColheita() - this.gastosTotalTalhao();
      addTituloSecao('Resultado');
      addTabela(
        [
          ['Receita Total', this.formatarValor(this.receitaTotalColheita())],
          ['Gastos Total', this.formatarValor(this.gastosTotalTalhao())],
          ['Lucro / Prejuízo', this.formatarValor(lucro)],
        ],
        { destaqueApartirDe: 2 },
      );

      const totalPaginas = doc.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...CINZA);
        doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
        doc.text('Fazenda Losardo', margin, pageHeight - 20);
      }

      const nomeArquivo = `resumo-talhao-${nomeTalhao.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      doc.save(nomeArquivo);
    } finally {
      if (abaAnterior !== 'resumo') {
        this.abaAtiva.set(abaAnterior);
      }
      this.exportandoPdf.set(false);
    }
  }
}