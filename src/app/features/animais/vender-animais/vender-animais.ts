import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCoins } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { IAnimal, OperacaoVenda } from '../../../shared/interfaces/IAnimal';

interface VenderAnimaisContext {
  fazendaId: number;
  animais: IAnimal[];
}

@Component({
  selector: 'app-vender-animais',
  imports: [HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmTextareaImports, NgIcon],
  providers: [provideIcons({ lucideCoins })],
  templateUrl: './vender-animais.html',
  styleUrl: './vender-animais.css',
})
export class VenderAnimais {
  context = injectBrnDialogContext<VenderAnimaisContext>();

  private animalService = inject(AnimalService);
  private toastService = inject(ToastService);
  private dialogRef = inject(BrnDialogRef);

  salvando = signal(false);
  valorRaw = signal('');
  data = signal(new Date().toISOString().substring(0, 10));
  descricao = signal('');

  valorNumero = computed(() => {
    const normalizado = this.valorRaw().replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(normalizado);
    return isNaN(numero) ? 0 : numero;
  });

  onValorInput(event: Event): void {
    this.valorRaw.set((event.target as HTMLInputElement).value);
  }

  onDataInput(event: Event): void {
    this.data.set((event.target as HTMLInputElement).value);
  }

  onDescricaoInput(event: Event): void {
    this.descricao.set((event.target as HTMLTextAreaElement).value);
  }

  confirmar(): void {
    if (this.valorNumero() <= 0) {
      this.toastService.showError('Erro', 'Informe o valor total da venda');
      return;
    }
    if (!this.data()) {
      this.toastService.showError('Erro', 'Informe a data da venda');
      return;
    }

    this.salvando.set(true);
    this.animalService
      .vender({
        animalIds: this.context.animais.map((a) => a.id),
        valor: this.valorNumero(),
        data: this.data(),
        descricao: this.descricao() || null,
        fazendaId: this.context.fazendaId,
      })
      .subscribe({
        next: (operacao: OperacaoVenda) => {
          this.salvando.set(false);
          const mensagem =
            operacao.lucro >= 0
              ? `Lucro de R$ ${operacao.lucro.toFixed(2)}`
              : `Prejuízo de R$ ${Math.abs(operacao.lucro).toFixed(2)}`;
          this.toastService.showSuccess('Venda registrada', mensagem);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível registrar a venda');
        },
      });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}