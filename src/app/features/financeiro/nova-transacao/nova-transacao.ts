import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWallet } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';

import { TransacoesService } from '../../../core/services/transacoes-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { ITransacao, TipoTransacao } from '../../../shared/intefaces/ITransacao';
import { INegocio } from '../../../shared/intefaces/INegocio';

interface NovaTransacaoContext {
  fazendaId: number;
  transacao?: ITransacao;
}

@Component({
  selector: 'app-nova-transacao',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    HlmTextareaImports,
    HlmSelectImports,
    HlmDatePickerImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideWallet })],
  styleUrl: './nova-transacao.css',
  templateUrl: './nova-transacao.html',
})
export class NovaTransacao implements OnInit {
  private readonly _dialogRef = inject<BrnDialogRef<ITransacao>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<NovaTransacaoContext>();
  private readonly fb = inject(FormBuilder);
  private readonly transacoesService = inject(TransacoesService);
  private readonly negocioService = inject(NegocioService);
  private readonly safraService = inject(SafraService);
  private toastService = inject(ToastService);

  modoEdicao = !!this._dialogContext.transacao;
  loading = signal(false);
  erro = signal<string | null>(null);

  negocios = signal<INegocio[]>([]);
  safras = signal<any[]>([]);

  maxDate = new Date();

  vinculoTipo = signal<'NEGOCIO' | 'SAFRA'>(this._dialogContext.transacao?.safraId ? 'SAFRA' : 'NEGOCIO');

  tipoOptions: { value: TipoTransacao; label: string }[] = [
    { value: 'RECEITA', label: 'Receita' },
    { value: 'GASTO', label: 'Gasto' },
  ];

  itemToStringTipo = (value: TipoTransacao | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label || '';

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  private parseData(data: string): Date {
    return new Date(`${data}T00:00:00`);
  }

  form = this.fb.group({
    tipo: [(this._dialogContext.transacao?.tipo ?? 'RECEITA') as TipoTransacao, [Validators.required]],
    data: [
      this._dialogContext.transacao ? this.parseData(this._dialogContext.transacao.data) : (null as Date | null),
      [Validators.required],
    ],
    valor: [this._dialogContext.transacao?.valor ?? (null as number | null), [Validators.required, Validators.min(0.01)]],
    descricao: [this._dialogContext.transacao?.descricao ?? ''],
    observacao: [this._dialogContext.transacao?.observacao ?? ''],
    negocioId: [this._dialogContext.transacao?.negocioId ?? (null as number | null)],
    safraId: [this._dialogContext.transacao?.safraId ?? (null as number | null)],
  });

  ngOnInit() {
    this.negocioService.listarTodosPorFazenda(this._dialogContext.fazendaId).subscribe((res) => {
      this.negocios.set(res);
    });

    this.safraService.buscarSafrasPorFazenda(this._dialogContext.fazendaId).subscribe((res) => {
      this.safras.set(res.content);
    });
  }

  onTipoChange(tipo: TipoTransacao | null | undefined) {
    if (tipo) this.form.patchValue({ tipo });
  }

  onNegocioChange(negocioId: number | null | undefined) {
    this.form.patchValue({ negocioId: negocioId ?? null });
  }

  onSafraChange(safraId: number | null | undefined) {
    this.form.patchValue({ safraId: safraId ?? null });
  }

  selecionarVinculo(tipo: 'NEGOCIO' | 'SAFRA') {
    this.vinculoTipo.set(tipo);
    if (tipo === 'NEGOCIO') {
      this.form.patchValue({ safraId: null });
    } else {
      this.form.patchValue({ negocioId: null });
    }
  }

  private formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.loading()) return;
    if (this.form.invalid) return;

    const valores = this.form.value;

    if (!valores.negocioId && !valores.safraId) {
      this.erro.set('Selecione um Negócio ou uma Safra para vincular a transação');
      return;
    }

    this.loading.set(true);
    this.erro.set(null);

    const payload = {
      data: this.formatarData(valores.data!),
      valor: valores.valor!,
      tipo: valores.tipo!,
      descricao: valores.descricao || undefined,
      observacao: valores.observacao || undefined,
      negocioId: valores.negocioId ?? undefined,
      safraId: valores.safraId ?? undefined,
    };

    const request$ = this.modoEdicao
      ? this.transacoesService.atualizar(this._dialogContext.transacao!.id, payload)
      : this.transacoesService.salvar({ ...payload, fazendaId: this._dialogContext.fazendaId });

    request$.subscribe({
      next: (transacao) => {
        this.loading.set(false);
        this.toastService.showSuccess(
          'Sucesso',
          this.modoEdicao ? 'Transação atualizada com sucesso!' : 'Transação registrada com sucesso!',
        );
        this._dialogRef.close(transacao);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set(
          this.modoEdicao ? 'Não foi possível atualizar a transação' : 'Não foi possível salvar a transação',
        );
      },
    });
  }
}