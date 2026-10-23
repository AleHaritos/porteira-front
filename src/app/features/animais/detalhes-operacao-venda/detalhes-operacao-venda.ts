import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideReceipt } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { OperacaoVenda } from '../../../shared/interfaces/IAnimal';

interface DetalhesOperacaoVendaContext {
  operacao: OperacaoVenda;
}

@Component({
  selector: 'app-detalhes-operacao-venda',
  imports: [HlmDialogImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideReceipt })],
  templateUrl: './detalhes-operacao-venda.html',
  styleUrl: './detalhes-operacao-venda.css',
})
export class DetalhesOperacaoVenda {
  context = injectBrnDialogContext<DetalhesOperacaoVendaContext>();

  private dialogRef = inject(BrnDialogRef);

  fechar(): void {
    this.dialogRef.close();
  }
}