import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWrench, lucideTruck, lucideBanknote, lucideHandshake } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ManutencaoService } from '../../../core/services/veiculos/manutencao-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { IEquipamento } from '../../../shared/interfaces/IEquipamento';
import { IFornecedor } from '../../../shared/interfaces/IFornecedor';
import { FormaPagamentoManutencao, TipoManutencao } from '../../../shared/interfaces/IManutencao';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { IVeiculo } from '../../../shared/interfaces/IVeiculos';
import { FornecedorService } from '../../../core/services/equipamento/fornecedor-service';
import { ManutencaoEquipamentoService } from '../../../core/services/equipamento/manutencao-equipamento-service';

type TipoAtivo = 'VEICULO' | 'EQUIPAMENTO';
type Vinculo = 'NEGOCIO' | 'SAFRA';

interface NovaManutencaoContext {
  fazendaId: number;
  tipoAtivoInicial: TipoAtivo;
  ativoIdInicial: number | null;
  veiculos: IVeiculo[];
  equipamentos: IEquipamento[];
}

@Component({
  selector: 'app-nova-manutencao',
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
  providers: [provideIcons({ lucideWrench, lucideTruck, lucideBanknote, lucideHandshake })],
  styleUrl: './nova-manutencao.css',
  templateUrl: './nova-manutencao.html',
})
export class NovaManutencao implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovaManutencaoContext>();
  private fb = inject(FormBuilder);
  private manutencaoService = inject(ManutencaoService);
  private manutencaoEquipamentoService = inject(ManutencaoEquipamentoService);
  private fornecedorService = inject(FornecedorService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  tipoAtivo = signal<TipoAtivo>(this.context.tipoAtivoInicial);
  ativoId = signal<number | null>(this.context.ativoIdInicial);

  formaPagamento = signal<FormaPagamentoManutencao>('A_VISTA');
  fornecedores = signal<IFornecedor[]>([]);
  fornecedorId = signal<number | null>(null);

  vinculo = signal<Vinculo>('NEGOCIO');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);

  valorRaw = signal<number | null>(null);
  kmAtualRaw = signal<number | null>(null);

  tipoOptions: { value: TipoManutencao; label: string }[] = [
    { value: 'PREVENTIVA', label: 'Preventiva' },
    { value: 'CORRETIVA', label: 'Corretiva' },
    { value: 'REVISAO', label: 'Revisão' },
    { value: 'TROCA_OLEO', label: 'Troca de Óleo' },
    { value: 'PNEUS', label: 'Pneus' },
    { value: 'OUTRA', label: 'Outra' },
  ];
  tipoSelecionado = signal<TipoManutencao>('PREVENTIVA');

  itemToStringTipo = (value: TipoManutencao | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label ?? '';

  itemToStringAtivo = (id: number | null | undefined) => {
    const lista = this.tipoAtivo() === 'VEICULO' ? this.context.veiculos : this.context.equipamentos;
    return lista.find((item) => item.id === id)?.nome ?? '';
  };

  itemToStringFornecedor = (id: number | null | undefined) =>
    this.fornecedores().find((f) => f.id === id)?.nome ?? '';

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome ?? '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome ?? '';

  form = this.fb.group({
    descricao: [''],
    data: [new Date(), Validators.required],
    observacao: [''],
  });

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;

    this.fornecedorService.listarPorFazenda(fazendaId).subscribe({
      next: (res) => this.fornecedores.set(res),
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar os fornecedores'),
    });

    this.negocioService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });
  }

  onTipoAtivoChange(tipo: TipoAtivo): void {
    this.tipoAtivo.set(tipo);
    this.ativoId.set(null);
  }

  onAtivoIdChange(value: number | null | undefined): void {
    this.ativoId.set(value ?? null);
  }

  onTipoChange(value: TipoManutencao | null | undefined): void {
    if (value) this.tipoSelecionado.set(value);
  }

  onFormaPagamentoChange(forma: FormaPagamentoManutencao): void {
    this.formaPagamento.set(forma);
    if (forma === 'A_VISTA') this.fornecedorId.set(null);
  }

  onFornecedorIdChange(value: number | null | undefined): void {
    this.fornecedorId.set(value ?? null);
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
    const n = Number(valor.replace(/\D/g, '')) / 100;
    this.valorRaw.set(isNaN(n) ? null : n);
  }

  onKmAtualInput(valor: string): void {
    const n = Number(valor.replace(/\D/g, ''));
    this.kmAtualRaw.set(valor === '' || isNaN(n) ? null : n);
  }

  formatarMoedaDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarKmDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR');
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid || this.ativoId() == null) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.valorRaw() || this.valorRaw()! <= 0) {
      this.toastService.showError('Erro', 'Informe o valor da manutenção');
      return;
    }

    const formaPagamento = this.formaPagamento();

    if (formaPagamento === 'FORNECEDOR_CREDENCIADO' && this.fornecedorId() == null) {
      this.toastService.showError('Erro', 'Selecione o fornecedor');
      return;
    }

    let negocioId: number | null = null;
    let safraId: number | null = null;

    if (formaPagamento === 'A_VISTA') {
      const vinculo = this.vinculo();
      negocioId = vinculo === 'NEGOCIO' ? this.negocioSelecionado() : null;
      safraId = vinculo === 'SAFRA' ? this.safraSelecionada() : null;

      if (!negocioId && !safraId) {
        this.toastService.showError('Erro', 'Selecione um negócio ou uma safra');
        return;
      }
    }

    this.salvando.set(true);

    const base = {
      tipo: this.tipoSelecionado(),
      descricao: this.form.value.descricao || undefined,
      data: (this.form.value.data as Date).toISOString().split('T')[0],
      valor: this.valorRaw()!,
      observacao: this.form.value.observacao || undefined,
      fazendaId: this.context.fazendaId,
      negocioId: negocioId ?? undefined,
      safraId: safraId ?? undefined,
      formaPagamento,
      fornecedorId: formaPagamento === 'FORNECEDOR_CREDENCIADO' ? this.fornecedorId()! : undefined,
    };

    const onSuccess = () => {
      this.toastService.showSuccess('Sucesso', 'Manutenção registrada com sucesso!');
      this.salvando.set(false);
      this.dialogRef.close(true);
    };

    const onError = () => {
      this.salvando.set(false);
      this.toastService.showError('Erro', 'Não foi possível salvar a manutenção');
    };

    if (this.tipoAtivo() === 'VEICULO') {
      this.manutencaoService
        .salvar({ ...base, veiculoId: this.ativoId()!, kmAtual: this.kmAtualRaw() ?? undefined })
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.manutencaoEquipamentoService
        .salvar({ ...base, equipamentoId: this.ativoId()! })
        .subscribe({ next: onSuccess, error: onError });
    }
  }
}