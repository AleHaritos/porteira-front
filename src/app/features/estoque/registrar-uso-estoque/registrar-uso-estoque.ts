import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePackageMinus } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { EstoqueService } from '../../../core/services/estoque/estoque-service';
import { ToastService } from '../../../core/services/toast-service';
import { IProdutoEstoque } from '../../../shared/interfaces/IProdutoEstoque';

interface RegistrarUsoContext {
  produto: IProdutoEstoque;
}

@Component({
  selector: 'app-registrar-uso-estoque',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmDatePickerImports, NgIcon],
  providers: [provideIcons({ lucidePackageMinus })],
  styleUrl: './registrar-uso-estoque.css',
  templateUrl: './registrar-uso-estoque.html',
})
export class RegistrarUsoEstoque {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<RegistrarUsoContext>();
  private fb = inject(FormBuilder);
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  quantidadeRaw = signal<number | null>(null);

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
    if (!this.quantidadeRaw() || this.quantidadeRaw()! <= 0 || this.form.invalid) {
      this.toastService.showError('Erro', 'Preencha a quantidade e a data');
      return;
    }

    this.salvando.set(true);
    const { data, observacao } = this.form.value;

    this.estoqueService
      .registrarUso(this.context.produto.id, {
        quantidade: this.quantidadeRaw()!,
        data: this.formatarDataIso(data as Date),
        observacao: observacao || undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Uso registrado');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.salvando.set(false);
          const mensagem = err?.error?.message || 'Não foi possível registrar o uso';
          this.toastService.showError('Erro', mensagem);
        },
      });
  }
}