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
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { PostoService } from '../../../core/services/veiculos/posto-service';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { IPosto } from '../../../shared/interfaces/IPosto';
import { ISafra } from '../../../shared/interfaces/ISafras';

type Vinculo = 'NEGOCIO' | 'SAFRA';

interface PagarPostoDialogContext {
  fazendaId: number;
  posto: IPosto;
}

@Component({
  selector: 'app-pagar-posto',
  imports: [
    ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports,
    HlmLabelImports, HlmSelectImports, HlmDatePickerImports, HlmTextareaImports, NgIcon,
  ],
  providers: [provideIcons({ lucideHandCoins })],
  styleUrl: './pagar-posto.css',
  templateUrl: './pagar-posto.html',
})
export class PagarPosto implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<PagarPostoDialogContext>();
  private fb = inject(FormBuilder);
  private postoService = inject(PostoService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private toastService = inject(ToastService);

  posto = this.context.posto;
  salvando = signal(false);
  maxDate = new Date();

  valorRaw = signal<number | null>(null);

  vinculo = signal<Vinculo>('NEGOCIO');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  form = this.fb.group({
    data: [new Date() as Date | null, Validators.required],
    observacao: [''],
  });

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;
    this.negocioService.listarTodosPorFazenda(fazendaId).subscribe({ next: (n) => this.negocios.set(n) });
    this.safraService.buscarSafrasPorFazenda(fazendaId).subscribe({ next: (s) => this.safras.set(s.content) });
  }

  onValorInput(valor: string) {
    const digitos = valor.replace(/\D/g, '');
    this.valorRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  formatarValorDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  onVinculoChange(vinculo: Vinculo) {
    this.vinculo.set(vinculo);
    this.negocioSelecionado.set(null);
    this.safraSelecionada.set(null);
  }

  onNegocioChange(id: number | null | undefined) { this.negocioSelecionado.set(id ?? null); }
  onSafraChange(id: number | null | undefined) { this.safraSelecionada.set(id ?? null); }

  cancelar() {
    this.dialogRef.close(false);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.valorRaw();
    if (!valor || valor <= 0) {
      this.toastService.showError('Erro', 'Informe o valor do pagamento');
      return;
    }

    if (valor > this.posto.saldoDevedor) {
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

    const { data, observacao } = this.form.value;

    this.salvando.set(true);
    this.postoService
      .registrarPagamento(this.posto.id, {
        valor,
        data: this.formatarDataIso(data!),
        negocioId: negocioId ?? undefined,
        safraId: safraId ?? undefined,
        observacao: observacao || undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.salvando.set(false);
          const mensagem = err?.error?.message || 'Não foi possível registrar o pagamento';
          this.toastService.showError('Erro', mensagem);
        },
      });
  }
}