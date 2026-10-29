import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShoppingCart } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { EstoqueService } from '../../../core/services/estoque/estoque-service';
import { ToastService } from '../../../core/services/toast-service';
import { IProdutoEstoque } from '../../../shared/interfaces/IProdutoEstoque';

interface RegistrarCompraContext {
  produto: IProdutoEstoque;
}

@Component({
  selector: 'app-registrar-compra-estoque',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmDatePickerImports, NgIcon],
  providers: [provideIcons({ lucideShoppingCart })],
  styleUrl: './registrar-compra-estoque.css',
  templateUrl: './registrar-compra-estoque.html',
})
export class RegistrarCompraEstoque {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<RegistrarCompraContext>();
  private fb = inject(FormBuilder);
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  quantidadeRaw = signal<number | null>(null);
  valorUnitarioRaw = signal<number | null>(null);

  form = this.fb.group({
    data: [new Date() as Date | null, Validators.required],
    observacao: [''],
  });

  formatarInputDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  onQuantidadeInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.quantidadeRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  onValorUnitarioInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.valorUnitarioRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (!this.quantidadeRaw() || this.quantidadeRaw()! <= 0 || !this.valorUnitarioRaw() || this.valorUnitarioRaw()! <= 0 || this.form.invalid) {
      this.toastService.showError('Erro', 'Preencha a quantidade, o valor e a data');
      return;
    }

    this.salvando.set(true);
    const { data, observacao } = this.form.value;

    this.estoqueService
      .registrarCompra(this.context.produto.id, {
        quantidade: this.quantidadeRaw()!,
        valorUnitario: this.valorUnitarioRaw()!,
        data: this.formatarDataIso(data as Date),
        observacao: observacao || undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Compra registrada');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível registrar a compra');
        },
      });
  }
}