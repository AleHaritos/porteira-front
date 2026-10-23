import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { OperacaoVenda } from '../../../shared/interfaces/IAnimal';
import { DetalhesOperacaoVenda } from '../detalhes-operacao-venda/detalhes-operacao-venda';

@Component({
  selector: 'app-operacoes-venda-tab',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmTableImports,
    HlmButtonImports,
    HlmDatePickerImports,
    HlmLabelImports,
    HlmPaginationImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideEye })],
  templateUrl: './operacoes-venda-tab.html',
  styleUrl: './operacoes-venda-tab.css',
})
export class OperacoesVendaTab implements OnInit {
  fazendaId = input.required<number>();

  private animalService = inject(AnimalService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  operacoes = signal<OperacaoVenda[]>([]);
  carregando = signal(false);

  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(this.primeiroDiaDoMes());
  dataFimControl = new FormControl<Date | null>(new Date());

  paginaAtual = signal(0);
  totalPaginas = signal(0);
  paginasVisiveis = computed(() => {
    const total = this.totalPaginas();
    const atual = this.paginaAtual();
    if (total <= 3) return Array.from({ length: total }, (_, i) => i);
    let inicio = Math.max(0, atual - 1);
    const fim = Math.min(total - 1, inicio + 2);
    inicio = Math.max(0, fim - 2);
    return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);
  });

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  ngOnInit(): void {
    this.carregar();
    this.dataInicioControl.valueChanges.subscribe(() => this.onFiltroDataChange());
    this.dataFimControl.valueChanges.subscribe(() => this.onFiltroDataChange());
  }

  onFiltroDataChange(): void {
    this.paginaAtual.set(0);
    this.carregar();
  }

  carregar(): void {
    const dataInicio = this.dataInicioControl.value;
    const dataFim = this.dataFimControl.value;
    if (!dataInicio || !dataFim) return;

    this.carregando.set(true);
    this.animalService
      .listarOperacoesVendaPorPeriodo(
        this.fazendaId(),
        dataInicio.toISOString().split('T')[0],
        dataFim.toISOString().split('T')[0],
        this.paginaAtual(),
        10,
      )
      .subscribe({
        next: (res) => {
          this.operacoes.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar as operações de venda');
        },
      });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas()) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  verDetalhes(operacao: OperacaoVenda): void {
    this.dialogService.open(DetalhesOperacaoVenda, {
      context: { operacao },
      contentClass: 'sm:!max-w-[600px]',
    });
  }
}