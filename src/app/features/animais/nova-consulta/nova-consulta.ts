import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSyringe } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ConsultaLoteService } from '../../../core/services/animais/consulta-lote-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { TipoConsulta } from '../../../shared/interfaces/IConsultaLote ';
import { ILote } from '../../../shared/interfaces/ILote';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';

type Vinculo = 'NEGOCIO' | 'SAFRA';

interface NovaConsultaContext {
  fazendaId: number;
  lote: ILote;
}

@Component({
  selector: 'app-nova-consulta',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmDatePickerImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideSyringe })],
  styleUrl: './nova-consulta.css',
  templateUrl: './nova-consulta.html',
})
export class NovaConsulta implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovaConsultaContext>();
  private fb = inject(FormBuilder);
  private consultaLoteService = inject(ConsultaLoteService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  custoRaw = signal<number | null>(null);
  quantidadeAnimaisRaw = signal<number | null>(null);

  vinculo = signal<Vinculo>('NEGOCIO');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);

  tipoOptions: { value: TipoConsulta; label: string }[] = [
    { value: 'VACINACAO', label: 'Vacinação' },
    { value: 'CONSULTA_VETERINARIA', label: 'Consulta Veterinária' },
    { value: 'EXAME', label: 'Exame' },
    { value: 'TRATAMENTO', label: 'Tratamento' },
    { value: 'OUTRA', label: 'Outra' },
  ];
  tipoSelecionado = signal<TipoConsulta>('VACINACAO');

  itemToStringTipo = (value: TipoConsulta | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label ?? '';

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome ?? '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome ?? '';

  form = this.fb.group({
    data: [new Date(), Validators.required],
    descricao: [''],
    observacao: [''],
  });

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;

    this.negocioService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });
  }

  onTipoChange(value: TipoConsulta | null | undefined): void {
    if (value) this.tipoSelecionado.set(value);
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

  onCustoInput(valor: string): void {
    const n = Number(valor.replace(/\D/g, '')) / 100;
    this.custoRaw.set(isNaN(n) ? null : n);
  }

  onQuantidadeAnimaisInput(valor: string): void {
    const n = Number(valor.replace(/\D/g, ''));
    this.quantidadeAnimaisRaw.set(valor === '' || isNaN(n) ? null : n);
  }

  formatarMoedaDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.quantidadeAnimaisRaw() || this.quantidadeAnimaisRaw()! <= 0) {
      this.toastService.showError('Erro', 'Informe a quantidade de animais');
      return;
    }

    if (this.quantidadeAnimaisRaw()! > this.context.lote.quantidade) {
      this.toastService.showError('Erro', 'A quantidade não pode ser maior que a do lote');
      return;
    }

    if (!this.custoRaw() || this.custoRaw()! <= 0) {
      this.toastService.showError('Erro', 'Informe o custo da consulta');
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

    this.consultaLoteService
      .salvar({
        loteId: this.context.lote.id,
        tipo: this.tipoSelecionado(),
        data: (this.form.value.data as Date).toISOString().split('T')[0],
        quantidadeAnimais: this.quantidadeAnimaisRaw()!,
        custo: this.custoRaw()!,
        descricao: this.form.value.descricao || undefined,
        observacao: this.form.value.observacao || undefined,
        fazendaId: this.context.fazendaId,
        negocioId: negocioId ?? undefined,
        safraId: safraId ?? undefined,
      })
      .subscribe({
        next: () => {
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível registrar a consulta');
        },
      });
  }
}