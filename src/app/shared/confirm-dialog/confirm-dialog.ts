import { Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';

export interface ConfirmDialogContext {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [HlmDialogImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideTriangleAlert })],
  styleUrl: './confirm-dialog.css',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  protected context = injectBrnDialogContext<ConfirmDialogContext>();
  private dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}