import { Component, ElementRef, OnInit, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileText } from '@ng-icons/lucide';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ResumoAnimaisService } from '../../../core/services/animais/resumo-animais-service';
import { IResumoAnimais } from '../../../shared/interfaces/IResumoAnimais';
import { GastosAnimaisCard } from '../gastos-animais-card/gastos-animais-card';
import { ReceitaGastosAnimaisCard } from '../receita-gastos-animais-card/receita-gastos-animais-card';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-resumo-animais-tab',
  imports: [ReactiveFormsModule, HlmDatePickerImports, HlmLabelImports, NgIcon, GastosAnimaisCard, ReceitaGastosAnimaisCard],
  providers: [provideIcons({ lucideFileText })],
  styleUrl: './resumo-animais-tab.css',
  templateUrl: './resumo-animais-tab.html',
})
export class ResumoAnimaisTab implements OnInit {
  fazendaId = input.required<number>();

  private resumoService = inject(ResumoAnimaisService);

  graficoGastosRef = viewChild<ElementRef<HTMLElement>>('graficoGastosWrap');
  graficoReceitaGastosRef = viewChild<ElementRef<HTMLElement>>('graficoReceitaGastosWrap');

  carregando = signal(false);
  exportandoPdf = signal(false);
  resumo = signal<IResumoAnimais | null>(null);

  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(this.primeiroDiaDoMes());
  dataFimControl = new FormControl<Date | null>(new Date());

  readonly formatarValor = (valor: number) => moeda.format(valor);

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  ngOnInit(): void {
    this.carregar();
    this.dataInicioControl.valueChanges.subscribe(() => this.carregar());
    this.dataFimControl.valueChanges.subscribe(() => this.carregar());
  }

  carregar(): void {
    const dataInicio = this.dataInicioControl.value;
    const dataFim = this.dataFimControl.value;
    if (!dataInicio || !dataFim) return;

    this.carregando.set(true);
    this.resumoService
      .buscar(this.fazendaId(), dataInicio.toISOString().split('T')[0], dataFim.toISOString().split('T')[0])
      .subscribe({
        next: (res) => {
          this.resumo.set(res);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
  }

  async exportarPdf(): Promise<void> {
    if (this.exportandoPdf()) return;
    const r = this.resumo();
    if (!r) return;

    this.exportandoPdf.set(true);

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;

      const dataInicio = this.dataInicioControl.value;
      const dataFim = this.dataFimControl.value;
      const periodoTexto =
        dataInicio && dataFim
          ? `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`
          : '';

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
      doc.text('Resumo de Animais', margin, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`${periodoTexto}  ·  Exportado em ${new Date().toLocaleDateString('pt-BR')}`, margin, 60);

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

      addTituloSecao('Resumo do Período');
      addTabela(
        [
          ['Receita de Vendas', this.formatarValor(r.receitaVendas)],
          ['Gasto com Alimentação', this.formatarValor(r.gastoAlimentacao)],
          ['Gasto com Vacinação', this.formatarValor(r.gastoVacinacao)],
          ['Gasto Total (Alimentação + Vacinação)', this.formatarValor(r.gastoTotal)],
          ['Custo das Vendas', this.formatarValor(r.custoVendas)],
          ['Lucro das Vendas', this.formatarValor(r.lucroVendas)],
        ],
        { destaqueApartirDe: 5 },
      );

      const elGastos = this.graficoGastosRef()?.nativeElement;
      if (elGastos) {
        addTituloSecao('Gastos por Tipo');
        const canvas = await html2canvas(elGastos, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const larguraImg = pageWidth - margin * 2;
        const alturaImg = (canvas.height / canvas.width) * larguraImg;
        garantirEspaco(alturaImg + 10);
        doc.addImage(imgData, 'PNG', margin, y, larguraImg, alturaImg);
        y += alturaImg + 20;
      }

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

      addTituloSecao(`Operações de Venda (${r.operacoesVenda.length})`);
      if (r.operacoesVenda.length === 0) {
        doc.setTextColor(...CINZA);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Nenhuma operação de venda no período', margin, y);
        y += 24;
      } else {
        const linhasVendas: (string | number)[][] = r.operacoesVenda.map((o) => [
          new Date(o.data + 'T00:00:00').toLocaleDateString('pt-BR'),
          o.descricao || '—',
          `${o.quantidadeAnimais} animal(is)`,
          this.formatarValor(o.valorVenda),
          this.formatarValor(o.custoTotal),
          this.formatarValor(o.lucro),
        ]);
        addTabela(linhasVendas, {
          head: ['Data', 'Descrição', 'Qtd.', 'Valor Venda', 'Custo', 'Lucro'],
        });
      }

      addTituloSecao(`Alimentação e Vacinação (${r.cuidados.length})`);
      if (r.cuidados.length === 0) {
        doc.setTextColor(...CINZA);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Nenhum registro de alimentação ou vacinação no período', margin, y);
        y += 24;
      } else {
        const linhasCuidados: (string | number)[][] = r.cuidados.map((c) => [
          new Date(c.data + 'T00:00:00').toLocaleDateString('pt-BR'),
          c.tipo === 'ALIMENTACAO' ? 'Alimentação' : 'Vacinação',
          c.piqueteNome || '—',
          c.destino,
          this.formatarValor(c.custo),
        ]);
        addTabela(linhasCuidados, {
          head: ['Data', 'Tipo', 'Piquete', 'Destino', 'Custo'],
        });
      }

      const totalPaginas = doc.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...CINZA);
        doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
        doc.text('Fazenda Losardo', margin, pageHeight - 20);
      }

      doc.save('resumo-animais.pdf');
    } finally {
      this.exportandoPdf.set(false);
    }
  }
}