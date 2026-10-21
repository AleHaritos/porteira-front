import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHandCoins } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { ManutencaoService } from '../../../core/services/veiculos/manutencao-service';
import { ManutencaoEquipamentoService } from '../../../core/services/equipamento/manutencao-equipamento-service';
import { ContaFornecedorService } from '../../../core/services/equipamento/conta-fornecedor-service';
import { ToastService } from '../../../core/services/toast-service';

type OrigemDebito = 'VEICULO' | 'EQUIPAMENTO' | 'CONTA';

interface PagarDebitoFornecedorContext {
  fazendaId: number;
  debitoId: number;
  origem: OrigemDebito;
  nomeAtivo: string;
  valor: number;
}

@Component({
  selector: 'app-pagar-debito-fornecedor',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmDatePickerImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideHandCoins })],
  styleUrl: './pagar-debito-fornecedor.css',
  templateUrl: './pagar-debito-fornecedor.html',
})
export class PagarDebitoFornecedor {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<PagarDebitoFornecedorContext>();
  private fb = inject(FormBuilder);
  private manutencaoService = inject(ManutencaoService);
  private manutencaoEquipamentoService = inject(ManutencaoEquipamentoService);
  private contaFornecedorService = inject(ContaFornecedorService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  form = this.fb.group({
    data: [new Date(), Validators.required],
  });

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.toastService.showError('Erro', 'Informe a data do pagamento');
      return;
    }

    const data = (this.form.value.data as Date).toISOString().split('T')[0];

    this.salvando.set(true);

    const onSuccess = () => {
      this.toastService.showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
      this.salvando.set(false);
      this.dialogRef.close(true);
    };

    const onError = () => {
      this.salvando.set(false);
      this.toastService.showError('Erro', 'Não foi possível registrar o pagamento');
    };

    switch (this.context.origem) {
      case 'CONTA':
        this.contaFornecedorService.darBaixa(this.context.debitoId, data).subscribe({ next: onSuccess, error: onError });
        break;
      case 'VEICULO':
        this.manutencaoService.darBaixa(this.context.debitoId, data).subscribe({ next: onSuccess, error: onError });
        break;
      case 'EQUIPAMENTO':
        this.manutencaoEquipamentoService.darBaixa(this.context.debitoId, data).subscribe({ next: onSuccess, error: onError });
        break;
    }
  }
}