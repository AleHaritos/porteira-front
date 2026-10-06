import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { TalhaoService } from '../../../core/services/talhao-service';
import { ITalhao } from '../../../shared/intefaces/ITalhao';

@Component({
 imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideMapPin })],
  selector: 'app-novo-talhao',
  styleUrl: './novo-talhao.css',
  templateUrl: './novo-talhao.html',
})
export class NovoTalhao {
  private readonly _dialogRef = inject<BrnDialogRef<ITalhao>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<{ safraId: number }>();
  private readonly fb = inject(FormBuilder);
  private readonly talhaoService = inject(TalhaoService);

  loading = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    nome: ['', [Validators.required]],
    areaHectares: [null as number | null, [Validators.required, Validators.min(0.01)]],
    localizacao: [''],
    observacao: [''],
  });

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    this.talhaoService
      .salvar({
        nome: this.form.value.nome!,
        areaHectares: this.form.value.areaHectares!,
        localizacao: this.form.value.localizacao || undefined,
        observacao: this.form.value.observacao || undefined,
        safraId: this._dialogContext.safraId,
      })
      .subscribe({
        next: (talhao) => {
          this.loading.set(false);
          this._dialogRef.close(talhao);
        },
        error: () => {
          this.loading.set(false);
          this.erro.set('Não foi possível salvar o talhão');
        },
      });
  }
}
