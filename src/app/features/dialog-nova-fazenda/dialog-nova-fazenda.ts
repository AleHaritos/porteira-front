import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { IFazenda } from '../../shared/intefaces/IFazenda';
import { FazendaService } from '../../core/services/fazenda-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHousePlus, lucidePlus } from '@ng-icons/lucide';

@Component({
  imports: [ReactiveFormsModule, HlmDialogImports, HlmInputImports, HlmLabelImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideHousePlus })],
  selector: 'app-dialog-nova-fazenda',
  styleUrl: './dialog-nova-fazenda.css',
  templateUrl: './dialog-nova-fazenda.html',
})
export class DialogNovaFazenda {

  private readonly _dialogRef = inject<BrnDialogRef<IFazenda>>(BrnDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly fazendaService = inject(FazendaService);


  loading = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    nome: ['', [Validators.required]],
    hectares: [null as number | null, [Validators.required, Validators.min(0.01)]],
    localizacao: [''],
  });

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    this.fazendaService
      .salvarFazenda({
        nome: this.form.value.nome!,
        hectares: this.form.value.hectares!,
        localizacao: this.form.value.localizacao ?? "",
      })
      .subscribe({
        next: (fazenda) => {
          this.loading.set(false);
          this._dialogRef.close(fazenda);
        },
        error: () => {
          this.loading.set(false);
          this.erro.set('Não foi possível salvar a fazenda');
        },
      });
  }
}
