import { Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRightLeft } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { IAnimal } from '../../../shared/interfaces/IAnimal';
import { IPiquete } from '../../../shared/interfaces/IPiquete';

interface TransferirAnimaisContext {
  fazendaId: number;
  animais: IAnimal[];
  piquetes: IPiquete[];
}

@Component({
  selector: 'app-transferir-animais',
  imports: [HlmDialogImports, HlmButtonImports, HlmLabelImports, HlmSelectImports, NgIcon],
  providers: [provideIcons({ lucideArrowRightLeft })],
  templateUrl: './transferir-animais.html',
  styleUrl: './transferir-animais.css',
})
export class TransferirAnimais {
  context = injectBrnDialogContext<TransferirAnimaisContext>();

  private animalService = inject(AnimalService);
  private toastService = inject(ToastService);
  private dialogRef = inject(BrnDialogRef);

  salvando = signal(false);
  piqueteDestinoId = signal<number | null>(null);

  itemToStringPiquete = (id: number | null | undefined) =>
    this.context.piquetes.find((p) => p.id === id)?.nome ?? 'Selecione o piquete';

  onPiqueteDestinoChange(value: number | null | undefined): void {
    this.piqueteDestinoId.set(value ?? null);
  }

  confirmar(): void {
    if (!this.piqueteDestinoId()) {
      this.toastService.showError('Erro', 'Selecione o piquete de destino');
      return;
    }

    this.salvando.set(true);
    this.animalService
      .transferir({
        animalIds: this.context.animais.map((a) => a.id),
        piqueteDestinoId: this.piqueteDestinoId()!,
        fazendaId: this.context.fazendaId,
      })
      .subscribe({
        next: () => {
          this.salvando.set(false);
          this.toastService.showSuccess('Sucesso', 'Animais transferidos com sucesso!');
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível transferir os animais');
        },
      });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}