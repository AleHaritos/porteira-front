import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWarehouse } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { EstoqueService } from '../../../core/services/estoque/estoque-service';
import { ToastService } from '../../../core/services/toast-service';

interface NovoProdutoEstoqueContext {
  fazendaId: number;
}

@Component({
  selector: 'app-novo-produto-estoque',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, NgIcon],
  providers: [provideIcons({ lucideWarehouse })],
  styleUrl: './novo-produto-estoque.css',
  templateUrl: './novo-produto-estoque.html',
})
export class NovoProdutoEstoque {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<NovoProdutoEstoqueContext>();
  private fb = inject(FormBuilder);
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);

  salvando = signal(false);

  form = this.fb.group({
    nome: ['', Validators.required],
  });

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Erro', 'Informe o nome do produto');
      return;
    }

    this.salvando.set(true);

    this.estoqueService
      .criarProduto({ fazendaId: this.context.fazendaId, nome: this.form.value.nome! })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Produto adicionado ao estoque');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível adicionar o produto');
        },
      });
  }
}