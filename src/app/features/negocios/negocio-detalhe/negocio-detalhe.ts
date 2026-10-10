import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTrendingUp,
  lucideTrendingDown,
  lucideTriangleAlert,
  lucideSearch,
  lucideChartColumn,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmLabelImports } from '@spartan-ng/helm/label';

import { TransacoesService } from '../../../core/services/transacoes-service';
import { ToastService } from '../../../core/services/toast-service';
import { ResumoFinanceiro } from '../../../shared/interfaces/ITransacao';

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
  imports: [ReactiveFormsModule, HlmButtonImports, HlmDatePickerImports, HlmLabelImports, NgIcon],
  providers: [
    provideIcons({ lucideTrendingUp, lucideTrendingDown, lucideTriangleAlert, lucideSearch, lucideChartColumn }),
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
  maxDate = new Date();

  resumo = signal<ResumoFinanceiro>({ totalReceitas: 0, totalGastos: 0, saldo: 0 });

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

  ngOnInit(): void {
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
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}