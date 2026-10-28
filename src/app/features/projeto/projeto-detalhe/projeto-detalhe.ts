import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrendingDown, lucideSearch, lucideFileDown } from '@ng-icons/lucide';
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

@Component({
  selector: 'app-projeto-detalhe',
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
    provideIcons({ lucideTrendingDown, lucideSearch, lucideFileDown }),
  ],
  styleUrl: './projeto-detalhe.css',
  templateUrl: './projeto-detalhe.html',
})
export class ProjetoDetalhe implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private transacoesService = inject(TransacoesService);
  private toastService = inject(ToastService);

  projetoId = signal<number | null>(null);
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
      const id = params.get('projetoId');
      this.projetoId.set(id ? Number(id) : null);
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
    const projetoId = this.projetoId();
    if (projetoId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;

    this.transacoesService
      .buscarResumoPorProjeto(
        projetoId,
        dataInicio ? this.formatarDataIso(dataInicio) : null,
        dataFim ? this.formatarDataIso(dataFim) : null,
      )
      .subscribe({
        next: (res) => this.resumo.set(res),
        error: () => this.toastService.showError('Erro', 'Não foi possível carregar o resumo do projeto'),
      });

    this.paginaAtual.set(0);
    this.carregarTransacoes();
  }

  carregarTransacoes(): void {
    const projetoId = this.projetoId();
    const fazendaId = this.fazendaId();
    if (projetoId == null || fazendaId == null) return;

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
        null,
        null,
        projetoId,
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

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  exportarPdf(): void {
    const projetoId = this.projetoId();
    const fazendaId = this.fazendaId();
    if (projetoId == null || fazendaId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;
    const inicio = dataInicio ? this.formatarDataIso(dataInicio) : null;
    const fim = dataFim ? this.formatarDataIso(dataFim) : null;

    this.exportandoPdf.set(true);

    this.transacoesService.listarComFiltros(fazendaId, inicio, fim, null, null, null, projetoId).subscribe({
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
    doc.text('Relatório do Projeto', margem, 17);

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

    doc.setFillColor(253, 232, 232);
    doc.roundedRect(margem, y, larguraPagina - margem * 2, 22, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Total de Gastos no Período', margem + 4, y + 8);

    doc.setFontSize(14);
    doc.setTextColor(192, 57, 43);
    doc.text(this.formatarValor(resumo.totalGastos), margem + 4, y + 18);

    y += 22 + 14;

    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(`Transações do Período (${transacoes.length})`, margem, y);

    const linhas = transacoes.map((t) => [
      this.formatarDataBr(this.parseDataIso(t.data)),
      t.descricao || '-',
      this.formatarValor(t.valor),
    ]);

    autoTable(doc, {
      startY: y + 4,
      head: [['Data', 'Descrição', 'Valor']],
      body: linhas,
      margin: { left: margem, right: margem },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [232, 245, 236], textColor: [39, 138, 76], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [251, 254, 252] },
      columnStyles: { 2: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          data.cell.styles.textColor = [192, 57, 43];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    doc.save(`relatorio-projeto-${this.formatarDataIso(new Date())}.pdf`);
  }
}