import { Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

@Component({
  imports: [HlmDialogImports],
  selector: 'app-dialog-nova-fazenda',
  styleUrl: './dialog-nova-fazenda.css',
  templateUrl: './dialog-nova-fazenda.html',
})
export class DialogNovaFazenda {

  private readonly _dialogRef = inject<BrnDialogRef<any>>(BrnDialogRef);
	private readonly _dialogContext = injectBrnDialogContext<{ fazenda: any }>();

  protected readonly _fazenda = this._dialogContext.fazenda;

	public selectUser(user: any) {
		this._dialogRef.close(user);
	}
}
