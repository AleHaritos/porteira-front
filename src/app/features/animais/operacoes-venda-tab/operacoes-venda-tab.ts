import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { OperacaoVenda } from '../../../shared/interfaces/IAnimal';
import { DetalhesOperacaoVenda } from '../detalhes-operacao-venda/detalhes-operacao-venda';

@Component({
  selector: 'app-operacoes-venda-tab',
  imports: [CommonModule, HlmTableImports, HlmButtonImports, NgIcon],
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

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.animalService.listarOperacoesVenda(this.fazendaId()).subscribe({
      next: (res) => {
        this.operacoes.set(res);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar as operações de venda');
      },
    });
  }

  verDetalhes(operacao: OperacaoVenda): void {
    this.dialogService.open(DetalhesOperacaoVenda, {
      context: { operacao },
      contentClass: 'sm:!max-w-[600px]',
    });
  }
}