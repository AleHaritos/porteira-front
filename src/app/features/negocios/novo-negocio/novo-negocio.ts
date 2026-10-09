import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBriefcase } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NegocioService } from '../../../core/services/negocio-service';
import { ToastService } from '../../../core/services/toast-service';
import { INegocio } from '../../../shared/interfaces/INegocio';

interface NovoNegocioContext {
  fazendaId: number;
  negocio?: INegocio;
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
  providers: [provideIcons({ lucideBriefcase })],
  selector: 'app-novo-negocio',
  styleUrl: './novo-negocio.css',
  templateUrl: './novo-negocio.html',
})
export class NovoNegocio {
  private readonly _dialogRef = inject<BrnDialogRef<INegocio>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<NovoNegocioContext>();
  private readonly fb = inject(FormBuilder);
  private readonly negocioService = inject(NegocioService);
  private toastService = inject(ToastService);

  modoEdicao = !!this._dialogContext.negocio;
  loading = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: [this._dialogContext.negocio?.nome ?? '', Validators.required],
    descricao: [this._dialogContext.negocio?.descricao ?? ''],
    observacoes: [this._dialogContext.negocio?.observacoes ?? ''],
  });

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.loading()) return;
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    const payload = {
      nome: valores.nome,
      descricao: valores.descricao || undefined,
      observacoes: valores.observacoes || undefined,
    };

    const request$ = this.modoEdicao
      ? this.negocioService.atualizar(this._dialogContext.negocio!.id, payload)
      : this.negocioService.salvar({ ...payload, fazendaId: this._dialogContext.fazendaId });

    request$.subscribe({
      next: (negocio) => {
        this.loading.set(false);
        this.toastService.showSuccess(
          'Sucesso',
          this.modoEdicao ? 'Negócio atualizado com sucesso!' : 'Negócio registrado com sucesso!',
        );
        this._dialogRef.close(negocio);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set(this.modoEdicao ? 'Não foi possível atualizar o negócio' : 'Não foi possível salvar o negócio');
      },
    });
  }
}