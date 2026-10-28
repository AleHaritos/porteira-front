import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSyringe } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ConsultaLoteService } from '../../../core/services/animais/consulta-lote-service';
import { ToastService } from '../../../core/services/toast-service';
import { IConsultaLote, TipoConsulta } from '../../../shared/interfaces/IConsultaLote ';
import { ILote } from '../../../shared/interfaces/ILote';

interface HistoricoConsultasContext {
  lote: ILote;
}

@Component({
  selector: 'app-historico-consultas',
  imports: [CommonModule, HlmDialogImports, HlmButtonImports, HlmTableImports, HlmPaginationImports, DatePipe, NgIcon],
  providers: [provideIcons({ lucideSyringe })],
  styleUrl: './historico-consultas.css',
  templateUrl: './historico-consultas.html',
})
export class HistoricoConsultas implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<HistoricoConsultasContext>();
  private consultaLoteService = inject(ConsultaLoteService);
  private toastService = inject(ToastService);

  consultas = signal<IConsultaLote[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

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
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.consultaLoteService.buscarPorLote(this.context.lote.id, this.paginaAtual(), 10).subscribe({
      next: (res) => {
        this.consultas.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar o histórico de consultas');
      },
    });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  tipoLabel(tipo: TipoConsulta): string {
    const labels: Record<TipoConsulta, string> = {
      VACINACAO: 'Vacinação',
      CONSULTA_VETERINARIA: 'Consulta Veterinária',
      EXAME: 'Exame',
      TRATAMENTO: 'Tratamento',
      OUTRA: 'Outra',
    };
    return labels[tipo];
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  vinculo(consulta: IConsultaLote): string {
    return consulta.negocioNome ?? consulta.safraNome ?? '-';
  }

  fechar(): void {
    this.dialogRef.close();
  }
}