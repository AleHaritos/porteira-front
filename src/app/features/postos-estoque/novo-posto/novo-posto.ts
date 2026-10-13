import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHandCoins } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ToastService } from '../../../core/services/toast-service';
import { PostoService } from '../../../core/services/veiculos/posto-service';

interface NovoPostoDialogContext {
  fazendaId: number;
}

@Component({
  selector: 'app-novo-posto',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmTextareaImports, NgIcon],
  providers: [provideIcons({ lucideHandCoins })],
  styleUrl: './novo-posto.css',
  templateUrl: './novo-posto.html',
})
export class NovoPosto {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<NovoPostoDialogContext>();
  private fb = inject(FormBuilder);
  private postoService = inject(PostoService);
  private toastService = inject(ToastService);

  salvando = signal(false);

  form = this.fb.group({
    nome: ['', Validators.required],
    observacao: [''],
  });

  cancelar() {
    this.dialogRef.close(false);
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nome, observacao } = this.form.value;

    this.salvando.set(true);
    this.postoService
      .salvar({ nome: nome!, fazendaId: this.context.fazendaId, observacao: observacao || undefined })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Posto cadastrado com sucesso!');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível cadastrar o posto');
        },
      });
  }
}
