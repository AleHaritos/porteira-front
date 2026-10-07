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
import { ITalhao } from '../../../shared/intefaces/ITalhao';
import { TalhaoService } from '../../../core/services/safra/talhao-service';

interface NovoTalhaoContext {
  safraId: number;
  talhao?: ITalhao;
}

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
  private readonly _dialogContext = injectBrnDialogContext<NovoTalhaoContext>();
  private readonly fb = inject(FormBuilder);
  private readonly talhaoService = inject(TalhaoService);

  modoEdicao = !!this._dialogContext.talhao;
  loading = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    nome: [this._dialogContext.talhao?.nome ?? '', [Validators.required]],
    areaHectares: [this._dialogContext.talhao?.areaHectares ?? (null as number | null), [Validators.required, Validators.min(0.01)]],
    localizacao: [this._dialogContext.talhao?.localizacao ?? ''],
    observacao: [this._dialogContext.talhao?.observacao ?? ''],
  });

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.loading()) return;
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    const payload = {
      nome: this.form.value.nome!,
      areaHectares: this.form.value.areaHectares!,
      localizacao: this.form.value.localizacao || undefined,
      observacao: this.form.value.observacao || undefined,
    };

    const request$ = this.modoEdicao
      ? this.talhaoService.atualizar(this._dialogContext.talhao!.id, payload)
      : this.talhaoService.salvar({ ...payload, safraId: this._dialogContext.safraId });

    request$.subscribe({
      next: (talhao) => {
        this.loading.set(false);
        this._dialogRef.close(talhao);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set(this.modoEdicao ? 'Não foi possível atualizar o talhão' : 'Não foi possível salvar o talhão');
      },
    });
  }
}