import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHandCoins } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { ManutencaoService } from '../../../core/services/veiculos/manutencao-service';
import { ManutencaoEquipamentoService } from '../../../core/services/equipamento/manutencao-equipamento-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { ContaFornecedorService } from '../../../core/services/equipamento/conta-fornecedor-service';

type Vinculo = 'NEGOCIO' | 'SAFRA';
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
    HlmSelectImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideHandCoins })],
  styleUrl: './pagar-debito-fornecedor.css',
  templateUrl: './pagar-debito-fornecedor.html',
})
export class PagarDebitoFornecedor implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<PagarDebitoFornecedorContext>();
  private fb = inject(FormBuilder);
  private manutencaoService = inject(ManutencaoService);
  private manutencaoEquipamentoService = inject(ManutencaoEquipamentoService);
  private contaFornecedorService = inject(ContaFornecedorService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  vinculo = signal<Vinculo>('NEGOCIO');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);

  form = this.fb.group({
    data: [new Date(), Validators.required],
  });

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome ?? '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome ?? '';

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;

    this.negocioService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });
  }

  onVinculoChange(vinculo: Vinculo): void {
    this.vinculo.set(vinculo);
    this.negocioSelecionado.set(null);
    this.safraSelecionada.set(null);
  }

  onNegocioChange(id: number | null | undefined): void {
    this.negocioSelecionado.set(id ?? null);
  }

  onSafraChange(id: number | null | undefined): void {
    this.safraSelecionada.set(id ?? null);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.toastService.showError('Erro', 'Informe a data do pagamento');
      return;
    }

    const vinculo = this.vinculo();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioSelecionado() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraSelecionada() : null;

    if (!negocioId && !safraId) {
      this.toastService.showError('Erro', 'Selecione um negócio ou uma safra');
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

    if (this.context.origem === 'VEICULO') {
      this.manutencaoService
        .darBaixa(this.context.debitoId, negocioId, safraId, data)
        .subscribe({ next: onSuccess, error: onError });
    } else if (this.context.origem === 'EQUIPAMENTO') {
      this.manutencaoEquipamentoService
        .darBaixa(this.context.debitoId, negocioId, safraId, data)
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.contaFornecedorService
        .darBaixa(this.context.debitoId, negocioId, safraId, data)
        .subscribe({ next: onSuccess, error: onError });
    }
  }
}