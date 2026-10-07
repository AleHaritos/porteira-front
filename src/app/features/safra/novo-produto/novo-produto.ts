import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePackage } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { ProdutoSafraService } from '../../../core/services/safra/produto-safra-service';
import { IProdutoSafra } from '../../../shared/intefaces/IProdutoSafra';
import { ToastService } from '../../../core/services/toast-service';

interface NovoProdutoContext {
  safraId: number;
  produto?: IProdutoSafra;
}

@Component({
  imports: [ReactiveFormsModule, HlmDialogImports, HlmInputImports, HlmLabelImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePackage })],
  selector: 'app-novo-produto',
  styleUrl: './novo-produto.css',
  templateUrl: './novo-produto.html',
})
export class NovoProduto {
  private readonly _dialogRef = inject<BrnDialogRef<IProdutoSafra>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<NovoProdutoContext>();
  private readonly fb = inject(FormBuilder);
  private readonly produtoSafraService = inject(ProdutoSafraService);
  private toastService = inject(ToastService);

  modoEdicao = !!this._dialogContext.produto;
  loading = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    nome: [this._dialogContext.produto?.nome ?? '', [Validators.required]],
    custo: [this._dialogContext.produto?.custo ?? (null as number | null), [Validators.required, Validators.min(0.01)]],
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
      custo: this.form.value.custo!,
    };

    const request$ = this.modoEdicao
      ? this.produtoSafraService.atualizar(this._dialogContext.produto!.id, payload)
      : this.produtoSafraService.salvar({ ...payload, safraId: this._dialogContext.safraId });

    request$.subscribe({
      next: (produto) => {
        this.loading.set(false);
        this.toastService.showSuccess(
          'Sucesso',
          this.modoEdicao ? 'Produto atualizado com sucesso!' : 'Produto salvo com sucesso!',
        );
        this._dialogRef.close(produto);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set(this.modoEdicao ? 'Não foi possível atualizar o produto' : 'Não foi possível salvar o produto');
      },
    });
  }
}