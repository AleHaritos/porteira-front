import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHandCoins } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { FornecedorService } from '../../../core/services/equipamento/fornecedor-service';
import { ToastService } from '../../../core/services/toast-service';
import { IFornecedor } from '../../../shared/interfaces/IFornecedor';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';

type Vinculo = 'NEGOCIO' | 'SAFRA';

interface PagarFornecedorContext {
  fazendaId: number;
  fornecedor: IFornecedor;
}

@Component({
  selector: 'app-pagar-fornecedor',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmDatePickerImports,
    HlmSelectImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideHandCoins })],
  styleUrl: './pagar-fornecedor.css',
  templateUrl: './pagar-fornecedor.html',
})
export class PagarFornecedor implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<PagarFornecedorContext>();
  private fb = inject(FormBuilder);
  private fornecedorService = inject(FornecedorService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();
  valorRaw = signal<number | null>(null);

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

  onValorInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.valorRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  formatarMoedaDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  salvar(): void {
    if (this.form.invalid || !this.valorRaw() || this.valorRaw()! <= 0) {
      this.toastService.showError('Erro', 'Informe um valor válido');
      return;
    }
    if (this.valorRaw()! > this.context.fornecedor.saldoDevedor) {
      this.toastService.showError('Erro', 'O valor não pode ser maior que o saldo devedor');
      return;
    }

    const vinculo = this.vinculo();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioSelecionado() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraSelecionada() : null;

    if (!negocioId && !safraId) {
      this.toastService.showError('Erro', 'Selecione um negócio ou uma safra');
      return;
    }

    this.salvando.set(true);
    this.fornecedorService
      .registrarPagamento(this.context.fornecedor.id, {
        valor: this.valorRaw()!,
        data: (this.form.value.data as Date).toISOString().split('T')[0],
        negocioId: negocioId ?? undefined,
        safraId: safraId ?? undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível registrar o pagamento');
        },
      });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}