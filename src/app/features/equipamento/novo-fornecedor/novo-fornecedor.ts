import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHandshake } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { FornecedorService } from '../../../core/services/equipamento/fornecedor-service';
import { ToastService } from '../../../core/services/toast-service';

interface FornecedorDialogContext {
  fazendaId: number;
}

@Component({
  selector: 'app-novo-fornecedor',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, NgIcon],
  providers: [provideIcons({ lucideHandshake })],
  styleUrl: './novo-fornecedor.css',
  templateUrl: './novo-fornecedor.html',
})
export class NovoFornecedor {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<FornecedorDialogContext>();
  private fb = inject(FormBuilder);
  private fornecedorService = inject(FornecedorService);
  private toastService = inject(ToastService);

  salvando = signal(false);

  form = this.fb.group({
    nome: ['', Validators.required],
    especialidade: [''],
    observacao: [''],
  });

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.fornecedorService.salvar({
      nome: this.form.value.nome!,
      especialidade: this.form.value.especialidade ?? undefined,
      observacao: this.form.value.observacao ?? undefined,
      fazendaId: this.context.fazendaId,
    }).subscribe({
      next: () => {
        this.salvando.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', 'Não foi possível cadastrar o fornecedor');
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
