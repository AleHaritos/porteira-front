import { Component, computed, inject, signal } from '@angular/core';
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
import { IFornecedorDebito } from '../../../shared/interfaces/IFornecedorDebito';
import { Observable } from 'rxjs';
import { ManutencaoParceladaService } from '../../../core/services/veiculos/manutencao-parcelada-service';

interface PagarDebitosSelecionadosContext {
  fazendaId: number;
  debitos: IFornecedorDebito[];
}

@Component({
  selector: 'app-pagar-debitos-selecionados',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmDatePickerImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideHandCoins })],
  styleUrl: './pagar-debitos-selecionados.css',
  templateUrl: './pagar-debitos-selecionados.html',
})
export class PagarDebitosSelecionados {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<PagarDebitosSelecionadosContext>();
  private fb = inject(FormBuilder);
  private manutencaoService = inject(ManutencaoService);
  private manutencaoEquipamentoService = inject(ManutencaoEquipamentoService);
  private contaFornecedorService = inject(ContaFornecedorService);
  private toastService = inject(ToastService);
  private manutencaoParceladaService = inject(ManutencaoParceladaService);

  salvando = signal(false);
  maxDate = new Date();

  form = this.fb.group({
    data: [new Date(), Validators.required],
  });

  totalValor = computed(() => this.context.debitos.reduce((soma, d) => soma + d.valor, 0));

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  nomeExibicao(debito: IFornecedorDebito): string {
    return debito.origem === 'CONTA' ? (debito.descricao || debito.nomeAtivo) : debito.nomeAtivo;
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  salvar(): void {
    if (this.form.invalid) {
      this.toastService.showError('Erro', 'Informe a data do pagamento');
      return;
    }

    const data = this.formatarDataIso(this.form.value.data as Date);
    const debitos = this.context.debitos;
    this.salvando.set(true);

    let sucesso = 0;
    let falha = 0;

    const finalizar = () => {
      if (sucesso + falha < debitos.length) return;
      this.salvando.set(false);

      if (falha === 0) {
        this.toastService.showSuccess('Sucesso', `${sucesso} pagamento(s) registrado(s) com sucesso!`);
      } else {
        this.toastService.showError('Erro', `${sucesso} pago(s), ${falha} falharam. Verifique e tente novamente.`);
      }

      this.dialogRef.close(sucesso > 0);
    };

    debitos.forEach((debito) => {
      const chamada: Observable<unknown> =
        debito.origem === 'CONTA'
          ? this.contaFornecedorService.darBaixa(debito.id, data)
          : debito.origem === 'VEICULO'
            ? this.manutencaoService.darBaixa(debito.id, data)
            : debito.origem === 'EQUIPAMENTO'
              ? this.manutencaoEquipamentoService.darBaixa(debito.id, data)
              : this.manutencaoParceladaService.darBaixa(debito.id, data);

      chamada.subscribe({
        next: () => {
          sucesso++;
          finalizar();
        },
        error: () => {
          falha++;
          finalizar();
        },
      });
    });
  }
}