import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHousePlus } from '@ng-icons/lucide';
import { IFazenda } from '../../../shared/interfaces/IFazenda';
import { FazendaService } from '../../../core/services/fazenda-service';

interface DialogNovaFazendaContext {
  fazenda?: IFazenda;
}

@Component({
  imports: [ReactiveFormsModule, HlmDialogImports, HlmInputImports, HlmLabelImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideHousePlus })],
  selector: 'app-dialog-nova-fazenda',
  styleUrl: './dialog-nova-fazenda.css',
  templateUrl: './dialog-nova-fazenda.html',
})
export class DialogNovaFazenda {

  private readonly _dialogRef = inject<BrnDialogRef<IFazenda>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<DialogNovaFazendaContext>();
  private readonly fb = inject(FormBuilder);
  private readonly fazendaService = inject(FazendaService);

  modoEdicao = !!this._dialogContext.fazenda?.id;
  loading = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    nome: [this._dialogContext.fazenda?.nome ?? '', [Validators.required]],
    hectares: [this._dialogContext.fazenda?.hectares ?? (null as number | null), [Validators.required, Validators.min(0.01)]],
    localizacao: [this._dialogContext.fazenda?.localizacao ?? ''],
  });

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    const payload = {
      nome: this.form.value.nome!,
      hectares: this.form.value.hectares!,
      localizacao: this.form.value.localizacao ?? '',
    };

    const request$ = this.modoEdicao
      ? this.fazendaService.atualizar(this._dialogContext.fazenda!.id, payload)
      : this.fazendaService.salvarFazenda(payload);

    request$.subscribe({
      next: (fazenda) => {
        this.loading.set(false);
        this._dialogRef.close(fazenda);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set(this.modoEdicao ? 'Não foi possível atualizar a fazenda' : 'Não foi possível salvar a fazenda');
      },
    });
  }
}