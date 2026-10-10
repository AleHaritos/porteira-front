import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrendingUp, lucideTrendingDown } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';

import { ContasPendentesService } from '../../../core/services/contas-pendentes-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { TipoTransacao } from '../../../shared/interfaces/ITransacao';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';

type Vinculo = 'NEGOCIO' | 'SAFRA';

interface ContaPendenteDialogContext {
  fazendaId: number;
}

@Component({
  selector: 'app-nova-conta-pendente',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmDatePickerImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideTrendingUp, lucideTrendingDown })],
  styleUrl: './nova-conta-pendente.css',
  templateUrl: './nova-conta-pendente.html',
})
export class NovaContaPendente implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<ContaPendenteDialogContext>();
  private fb = inject(FormBuilder);
  private contasPendentesService = inject(ContasPendentesService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private toastService = inject(ToastService);

  maxDate = new Date(2100, 0, 1);
  salvando = signal(false);

  tipo = signal<TipoTransacao>('RECEITA');
  vinculo = signal<Vinculo>('NEGOCIO');

  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);

  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);

  numeroParcelas = signal(1);
  valoresParcelas = signal<number[]>([0]);

  totalParcelas = computed(() => this.valoresParcelas().reduce((acc, v) => acc + (Number(v) || 0), 0));

  form = this.fb.group({
    descricao: ['', Validators.required],
    primeiraDataVencimento: [new Date() as Date | null, Validators.required],
    observacao: [''],
  });

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;

    this.negocioService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });
  }

  onTipoChange(tipo: TipoTransacao) {
    this.tipo.set(tipo);
  }

  onVinculoChange(vinculo: Vinculo) {
    this.vinculo.set(vinculo);
    this.negocioSelecionado.set(null);
    this.safraSelecionada.set(null);
  }

  onNegocioChange(id: number | null | undefined) {
    this.negocioSelecionado.set(id ?? null);
  }

  onSafraChange(id: number | null | undefined) {
    this.safraSelecionada.set(id ?? null);
  }

  onNumeroParcelasChange(valor: string) {
    const n = Math.max(1, Number(valor) || 1);
    this.numeroParcelas.set(n);

    const atuais = this.valoresParcelas();
    const novos = Array.from({ length: n }, (_, i) => atuais[i] ?? 0);
    this.valoresParcelas.set(novos);
  }

  onValorParcelaChange(index: number, valor: string) {
    const valores = [...this.valoresParcelas()];
    valores[index] = Number(valor) || 0;
    this.valoresParcelas.set(valores);
  }

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

    const valores = this.valoresParcelas();
    if (valores.length === 0 || valores.some((v) => !v || v <= 0)) {
      this.toastService.showError('Erro', 'Preencha o valor de todas as parcelas');
      return;
    }

    const vinculo = this.vinculo();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioSelecionado() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraSelecionada() : null;

    if (!negocioId && !safraId) {
      this.toastService.showError('Erro', 'Selecione um negócio ou uma safra');
      return;
    }

    const { descricao, primeiraDataVencimento, observacao } = this.form.value;

    this.salvando.set(true);
    this.contasPendentesService
      .salvar({
        descricao: descricao || undefined,
        valoresParcelas: valores,
        primeiraDataVencimento: this.formatarDataIso(primeiraDataVencimento!),
        tipo: this.tipo(),
        fazendaId: this.context.fazendaId,
        negocioId: negocioId ?? undefined,
        safraId: safraId ?? undefined,
        observacao: observacao || undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Conta pendente criada com sucesso!');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível criar a conta pendente');
        },
      });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}