import { Component, ElementRef, OnInit, computed, inject, input, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLandPlot,
  lucideCalculator,
  lucideWallet,
  lucideFuel,
  lucideWheat,
  lucideFileText,
} from '@ng-icons/lucide';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { TransacoesService } from '../../../core/services/transacoes-service';
import { CustoFixoTalhaoService } from '../../../core/services/safra/custo-fixo-talhao-service';
import { CustoCategoriaSafraService } from '../../../core/services/safra/custo-categoria-safra-service';
import { ColheitaTalhaoService } from '../../../core/services/safra/colheita-talhao-service';
import { ManejoService } from '../../../core/services/safra/manejo-service';
import { ITalhao } from '../../../shared/interfaces/ITalhao';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { ICustoFixoTalhao } from '../../../shared/interfaces/ICustoFixoTalhao';
import { IColheitaTalhao } from '../../../shared/interfaces/IColheitaTalhao';
import { ICustosCombustivelManutencao } from '../../../shared/interfaces/ICustosCombustivelManutencao';
import { ReceitaGastosTalhaoCard } from '../receita-gastos-talhao-card/receita-gastos-talhao-card';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numeroFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

@Component({
  selector: 'app-safra-resumo-talhoes',
  imports: [NgIcon, ReceitaGastosTalhaoCard],
  providers: [
    provideIcons({
      lucideLandPlot,
      lucideCalculator,
      lucideWallet,
      lucideFuel,
      lucideWheat,
      lucideFileText,
    }),
  ],
  styleUrls: ['./safra-resumo-talhoes.css', '../talhao-detalhes/talhao-detalhes.css'],
  templateUrl: './safra-resumo-talhoes.html',
})
export class SafraResumoTalhoes implements OnInit {
  private talhaoService = inject(TalhaoService);
  private safraService = inject(SafraService);
  private manejoService = inject(ManejoService);
  private transacoesService = inject(TransacoesService);
  private custoFixoTalhaoService = inject(CustoFixoTalhaoService);
  private custoCategoriaSafraService = inject(CustoCategoriaSafraService);
  private colheitaTalhaoService = inject(ColheitaTalhaoService);

  safraId = input.required<number>();

  graficoReceitaGastosRef = viewChild<ElementRef<HTMLElement>>('graficoReceitaGastosWrap');

  talhoesAtivos = signal<ITalhao[]>([]);
  safra = signal<ISafra | null>(null);
  custoTotalSafra = signal<number>(0);
  custosFixos = signal<ICustoFixoTalhao[]>([]);
  custosCombustivelManutencao = signal<ICustosCombustivelManutencao | null>(null);
  colheitas = signal<IColheitaTalhao[]>([]);
  custoManejoTotal = signal(0);
  carregando = signal(false);
  exportandoPdf = signal(false);

  areaTotalAtivos = computed(() => this.talhoesAtivos().reduce((soma, t) => soma + t.areaHectares, 0));

  proporcaoArea = computed(() => {
    const safra = this.safra();
    if (!safra || !safra.areaTotal) return 0;
    return this.areaTotalAtivos() / safra.areaTotal;
  });

  custoEstimado = computed(() => this.custoTotalSafra() * this.proporcaoArea());

  gastosTotal = computed(() => this.custoEstimado() + this.totalCustosFixos() + this.custoManejoTotal());

  custoTotalPorHectare = computed(() => {
    const area = this.areaTotalAtivos();
    return area ? this.gastosTotal() / area : 0;
  });

  totalCustosFixos = computed(() => this.custosFixos().reduce((soma, c) => soma + c.valor, 0));
  totalCustosArrendo = computed(() =>
    this.custosFixos().filter((c) => c.arrendo).reduce((soma, c) => soma + c.valor, 0),
  );
  totalCustosExtra = computed(() =>
    this.custosFixos().filter((c) => !c.arrendo).reduce((soma, c) => soma + c.valor, 0),
  );

  custoCombustivelEstimado = computed(
    () => (this.custosCombustivelManutencao()?.totalCombustivel ?? 0) * this.proporcaoArea(),
  );
  custoManutencaoEstimado = computed(
    () => (this.custosCombustivelManutencao()?.totalManutencao ?? 0) * this.proporcaoArea(),
  );
  custoCombustivelManutencaoEstimado = computed(
    () => this.custoCombustivelEstimado() + this.custoManutencaoEstimado(),
  );

  custoCombustivelPorHa = computed(() => {
    const area = this.areaTotalAtivos();
    return area ? this.custoCombustivelEstimado() / area : 0;
  });

  custoManutencaoPorHa = computed(() => {
    const area = this.areaTotalAtivos();
    return area ? this.custoManutencaoEstimado() / area : 0;
  });

  producaoTotalColheita = computed(() => this.colheitas().reduce((soma, c) => soma + c.quantidadeColhida, 0));
  receitaTotalColheita = computed(() =>
    this.colheitas().reduce((soma, c) => soma + c.quantidadeColhida * c.valorUnitario, 0),
  );
  mediaValorColheita = computed(() =>
    this.producaoTotalColheita() ? this.receitaTotalColheita() / this.producaoTotalColheita() : 0,
  );
  producaoPorHaColheita = computed(() => {
    const area = this.areaTotalAtivos();
    return area ? this.producaoTotalColheita() / area : 0;
  });
  receitaPorHaColheita = computed(() => {
    const area = this.areaTotalAtivos();
    return area ? this.receitaTotalColheita() / area : 0;
  });

  custoPorUnidadeProduzida = computed(() => {
    const producao = this.producaoTotalColheita();
    return producao ? this.gastosTotal() / producao : 0;
  });

  temProducaoColheita = computed(() => this.producaoTotalColheita() > 0);

  readonly formatarValor = (valor: number) => moeda.format(valor);
  readonly formatarSacas = (valor: number) => `${numeroFormatter.format(valor)} sc`;
  readonly formatarArea = (valor: number) => numeroFormatter.format(valor);

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    const safraId = this.safraId();

    forkJoin({
      talhoes: this.talhaoService.listarTodosPorSafra(safraId),
      safra: this.safraService.buscarPorId(safraId),
      categorias: this.custoCategoriaSafraService.buscar(safraId),
      resumo: this.transacoesService.buscarResumoPorSafra(safraId, null, null),
    })
      .pipe(
        switchMap((base) => {
          const ativos = base.talhoes.filter((t) => t.ativo);

          // forkJoin([]) completa sem emitir, por isso o caso "sem talhões" é tratado à parte
          if (!ativos.length) {
            return of({
              ...base,
              ativos,
              custosFixos: [] as ICustoFixoTalhao[],
              colheitas: [] as IColheitaTalhao[],
              custoManejo: 0,
            });
          }

          return forkJoin({
            custosFixos: forkJoin(ativos.map((t) => this.custoFixoTalhaoService.listarPorTalhao(t.id))),
            colheitas: forkJoin(ativos.map((t) => this.colheitaTalhaoService.listarPorTalhao(t.id))),
            manejos: forkJoin(ativos.map((t) => this.manejoService.listarTodosPorTalhao(t.id))),
          }).pipe(
            map((r) => ({
              ...base,
              ativos,
              custosFixos: r.custosFixos.flat(),
              colheitas: r.colheitas.flat(),
              custoManejo: r.manejos.flat().reduce((soma, m) => soma + m.custoTotal, 0),
            })),
          );
        }),
      )
      .subscribe({
        next: (dados) => {
          this.talhoesAtivos.set(dados.ativos);
          this.safra.set(dados.safra);
          this.custosCombustivelManutencao.set(dados.categorias);
          this.custoTotalSafra.set(dados.resumo.totalGastos);
          this.custosFixos.set(dados.custosFixos);
          this.colheitas.set(dados.colheitas);
          this.custoManejoTotal.set(dados.custoManejo);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
  }

  async exportarPdf(): Promise<void> {
    if (this.exportandoPdf()) return;
    this.exportandoPdf.set(true);

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const quantidadeTalhoes = this.talhoesAtivos().length;
      const areaHectares = this.areaTotalAtivos();

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
      doc.text('Resumo dos Talhões Ativos', margin, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `${quantidadeTalhoes} talhão(ões)  ·  ${this.formatarArea(areaHectares)} ha  ·  Exportado em ${new Date().toLocaleDateString('pt-BR')}`,
        margin,
        60,
      );

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
        y += 12;
      };
      const LARGURA_TABELA = pageWidth - margin * 2;
      const LARGURA_COLUNA_VALOR = 110;

      const addTabela = (
        body: (string | number)[][],
        opcoes?: { head?: string[]; destaqueApartirDe?: number },
      ) => {
        const temCabecalho = !!opcoes?.head;
        const linhas: (string | number)[][] = temCabecalho ? [opcoes!.head as string[], ...body] : body;
        const numColunas = linhas[0]?.length ?? 2;
        const ultimaColuna = numColunas - 1;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const columnStyles: Record<number, any> = {
          0: { halign: 'left' as const },
          [ultimaColuna]: { halign: 'right' as const, cellWidth: LARGURA_COLUNA_VALOR },
        };
        for (let i = 1; i < ultimaColuna; i++) {
          columnStyles[i] = { halign: 'right' as const };
        }

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          tableWidth: LARGURA_TABELA,
          body: linhas,
          theme: 'plain',
          styles: {
            fontSize: 10,
            cellPadding: 5,
            textColor: TEXTO,
            font: 'helvetica',
            fontStyle: 'normal',
            halign: 'left',
            valign: 'middle',
            lineWidth: 0,
          },
          columnStyles,
          didParseCell: (data) => {
            if (temCabecalho && data.row.index === 0) {
              data.cell.styles.fillColor = VERDE_TABELA;
              data.cell.styles.textColor = BRANCO;
              data.cell.styles.fontStyle = 'bold';
              return;
            }

            const indiceDestaque =
              opcoes?.destaqueApartirDe !== undefined
                ? opcoes.destaqueApartirDe + (temCabecalho ? 1 : 0)
                : undefined;

            if (indiceDestaque !== undefined && data.row.index >= indiceDestaque) {
              data.cell.styles.fillColor = VERDE_CLARO;
              data.cell.styles.textColor = VERDE_TEXTO;
              data.cell.styles.fontStyle = 'bold';
              return;
            }

            if (temCabecalho && (data.row.index - 1) % 2 === 1) {
              data.cell.styles.fillColor = LINHA_ALTERNADA;
            }
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 32;
      };

      // Rateio geral
      addTituloSecao('Custo Estimado dos Talhões (Rateio)');
      addTabela(
        [
          ['Área dos talhões ativos', `${this.formatarArea(areaHectares)} ha`],
          ['Área total da safra', `${this.safra()?.areaTotal ?? 0} ha`],
          ['Gastos totais da safra', this.formatarValor(this.custoTotalSafra())],
          ['Custo estimado dos talhões', this.formatarValor(this.gastosTotal())],
          ['Custo estimado por hectare', this.formatarValor(this.custoTotalPorHectare())],
        ],
        { destaqueApartirDe: 3 },
      );

      // Custos Fixos (resumo por tipo + total)
      addTituloSecao(`Custos Fixos (${this.custosFixos().length})`);
      addTabela(
        [
          ['Arrendos', this.formatarValor(this.totalCustosArrendo())],
          ['Custos Extras', this.formatarValor(this.totalCustosExtra())],
          ['Total de Custos Fixos', this.formatarValor(this.totalCustosFixos())],
        ],
        { head: ['Descrição', 'Valor'], destaqueApartirDe: 2 },
      );

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
        { head: ['Categoria', 'Total Safra', 'Valor Atribuído aos Talhões', 'Por Hectare'] },
      );

      // Colheita
      addTituloSecao(`Colheita (${this.colheitas().length} registro(s))`);
      const linhasColheita: (string | number)[][] = this.colheitas().map((c) => [
        c.descricao || '—',
        this.formatarSacas(c.quantidadeColhida),
        this.formatarValor(c.valorUnitario),
        this.formatarValor(c.quantidadeColhida * c.valorUnitario),
      ]);
      const indiceInicioTotaisColheita = linhasColheita.length;
      linhasColheita.push(
        ['Total de sc', this.formatarSacas(this.producaoTotalColheita()), '', ''],
        ['Produção por hectare', this.formatarSacas(this.producaoPorHaColheita()), '', ''],
        ['Média de valor', '', this.formatarValor(this.mediaValorColheita()), ''],
        ['Receita Total', '', '', this.formatarValor(this.receitaTotalColheita())],
        ['Receita por Hectare', '', '', this.formatarValor(this.receitaPorHaColheita())],
      );
      addTabela(linhasColheita, {
        head: ['Descrição', 'Quantidade', 'Valor Unitário', 'Receita'],
        destaqueApartirDe: indiceInicioTotaisColheita,
      });

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
      const lucro = this.receitaTotalColheita() - this.gastosTotal();
      addTituloSecao('Resultado');
      addTabela(
        [
          ['Receita Total', this.formatarValor(this.receitaTotalColheita())],
          ['Gastos Total', this.formatarValor(this.gastosTotal())],
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

      doc.save(`resumo-talhoes-safra-${this.safraId()}.pdf`);
    } finally {
      this.exportandoPdf.set(false);
    }
  }
}