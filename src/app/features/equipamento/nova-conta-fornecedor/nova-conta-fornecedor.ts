import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideReceipt } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { ContaFornecedorService } from '../../../core/services/equipamento/conta-fornecedor-service';
import { ToastService } from '../../../core/services/toast-service';

interface NovaContaFornecedorContext {
  fazendaId: number;
  fornecedorId: number;
}

@Component({
  selector: 'app-nova-conta-fornecedor',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmDatePickerImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideReceipt })],
  styleUrl: './nova-conta-fornecedor.css',
  templateUrl: './nova-conta-fornecedor.html',
})
export class NovaContaFornecedor {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovaContaFornecedorContext>();
  private fb = inject(FormBuilder);
  private contaFornecedorService = inject(ContaFornecedorService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();
  valorRaw = signal<number | null>(null);

  form = this.fb.group({
    descricao: ['', Validators.required],
    data: [new Date(), Validators.required],
  });

  onValorInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.valorRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  formatarMoedaDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid || !this.valorRaw() || this.valorRaw()! <= 0) {
      this.toastService.showError('Erro', 'Preencha a descrição e um valor válido');
      return;
    }

    this.salvando.set(true);

    this.contaFornecedorService
      .salvar({
        fornecedorId: this.context.fornecedorId,
        fazendaId: this.context.fazendaId,
        descricao: this.form.value.descricao!,
        data: (this.form.value.data as Date).toISOString().split('T')[0],
        valor: this.valorRaw()!,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Conta lançada com sucesso!');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível lançar a conta');
        },
      });
  }
}