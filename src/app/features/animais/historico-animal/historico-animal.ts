import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHistory } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { AnimalCusto, HistoricoCuidadoAnimal, IAnimal } from '../../../shared/interfaces/IAnimal';

interface HistoricoAnimalContext {
  animal: IAnimal;
}

@Component({
  selector: 'app-historico-animal',
  imports: [CommonModule, HlmDialogImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideHistory })],
  templateUrl: './historico-animal.html',
  styleUrl: './historico-animal.css',
})
export class HistoricoAnimal implements OnInit {
  context = injectBrnDialogContext<HistoricoAnimalContext>();

  private animalService = inject(AnimalService);
  private toastService = inject(ToastService);
  private dialogRef = inject(BrnDialogRef);

  carregando = signal(true);
  historico = signal<HistoricoCuidadoAnimal[]>([]);
  custo = signal<AnimalCusto | null>(null);

  ngOnInit(): void {
    this.animalService.calcularCusto(this.context.animal.id).subscribe({
      next: (res) => this.custo.set(res),
      error: () => this.toastService.showError('Erro', 'Não foi possível calcular o custo do animal'),
    });

    this.animalService.listarHistorico(this.context.animal.id).subscribe({
      next: (res) => {
        this.historico.set(res);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar o histórico do animal');
      },
    });
  }

  tipoLabel(tipo: 'VACINACAO' | 'ALIMENTACAO'): string {
    return tipo === 'VACINACAO' ? 'Vacinação' : 'Alimentação';
  }

  fechar(): void {
    this.dialogRef.close();
  }
}