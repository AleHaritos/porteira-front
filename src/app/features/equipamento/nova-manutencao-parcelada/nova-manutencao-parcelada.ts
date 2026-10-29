import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWrench, lucideTruck, lucideHandshake, lucideCalendarClock } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ManutencaoParceladaService } from '../../../core/services/veiculos/manutencao-parcelada-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { IEquipamento } from '../../../shared/interfaces/IEquipamento';
import { IFornecedor } from '../../../shared/interfaces/IFornecedor';
import { TipoManutencao } from '../../../shared/interfaces/IManutencao';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { IProjeto } from '../../../shared/interfaces/IProjeto';
import { IVeiculo } from '../../../shared/interfaces/IVeiculos';
import { FornecedorService } from '../../../core/services/equipamento/fornecedor-service';
import { ProjetoService } from '../../../core/services/projeto/projeto-service';

type TipoAtivo = 'VEICULO' | 'EQUIPAMENTO';
type Vinculo = 'NEGOCIO' | 'SAFRA' | 'PROJETO';

interface NovaManutencaoParceladaContext {
  fazendaId: number;
  tipoAtivoInicial: TipoAtivo;
  ativoIdInicial: number | null;
  veiculos: IVeiculo[];
  equipamentos: IEquipamento[];
}

@Component({
  selector: 'app-nova-manutencao-parcelada',
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
  providers: [provideIcons({ lucideWrench, lucideTruck, lucideHandshake, lucideCalendarClock })],
  styleUrl: './nova-manutencao-parcelada.css',
  templateUrl: './nova-manutencao-parcelada.html',
})
export class NovaManutencaoParcelada implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovaManutencaoParceladaContext>();
  private fb = inject(FormBuilder);
  private manutencaoParceladaService = inject(ManutencaoParceladaService);
  private fornecedorService = inject(FornecedorService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private projetoService = inject(ProjetoService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  tipoAtivo = signal<TipoAtivo>(this.context.tipoAtivoInicial);
  ativoId = signal<number | null>(this.context.ativoIdInicial);

  fornecedores = signal<IFornecedor[]>([]);
  fornecedorId = signal<number | null>(null);

  vinculo = signal<Vinculo>('NEGOCIO');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  projetos = signal<IProjeto[]>([]);
  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);
  projetoSelecionado = signal<number | null>(null);

  valorTotalRaw = signal<number | null>(null);
  kmAtualRaw = signal<number | null>(null);
  numeroParcelas = signal<number>(2);

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

  itemToStringProjeto = (value: number | null | undefined) =>
    this.projetos().find((p) => p.id === value)?.nome ?? '';

  valorParcela = computed(() => {
    const total = this.valorTotalRaw();
    const n = this.numeroParcelas();
    if (!total || !n) return 0;
    return total / n;
  });

  form = this.fb.group({
    descricao: [''],
    primeiraDataVencimento: [new Date(), Validators.required],
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

    this.projetoService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (projetos) => this.projetos.set(projetos),
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

  onFornecedorIdChange(value: number | null | undefined): void {
    this.fornecedorId.set(value ?? null);
  }

  onVinculoChange(vinculo: Vinculo): void {
    this.vinculo.set(vinculo);
    this.negocioSelecionado.set(null);
    this.safraSelecionada.set(null);
    this.projetoSelecionado.set(null);
  }

  onNegocioChange(id: number | null | undefined): void {
    this.negocioSelecionado.set(id ?? null);
  }

  onSafraChange(id: number | null | undefined): void {
    this.safraSelecionada.set(id ?? null);
  }

  onProjetoChange(id: number | null | undefined): void {
    this.projetoSelecionado.set(id ?? null);
  }

  onValorTotalInput(valor: string): void {
    const n = Number(valor.replace(/\D/g, '')) / 100;
    this.valorTotalRaw.set(isNaN(n) ? null : n);
  }

  onKmAtualInput(valor: string): void {
    const n = Number(valor.replace(/\D/g, ''));
    this.kmAtualRaw.set(valor === '' || isNaN(n) ? null : n);
  }

  onNumeroParcelasInput(valor: string): void {
    const n = Number(valor.replace(/\D/g, ''));
    this.numeroParcelas.set(isNaN(n) || n < 2 ? 2 : n);
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

    if (!this.valorTotalRaw() || this.valorTotalRaw()! <= 0) {
      this.toastService.showError('Erro', 'Informe o valor total da manutenção');
      return;
    }

    if (this.fornecedorId() == null) {
      this.toastService.showError('Erro', 'Selecione o fornecedor');
      return;
    }

    const vinculo = this.vinculo();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioSelecionado() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraSelecionada() : null;
    const projetoId = vinculo === 'PROJETO' ? this.projetoSelecionado() : null;

    if (!negocioId && !safraId && !projetoId) {
      this.toastService.showError('Erro', 'Selecione um negócio, uma safra ou um projeto');
      return;
    }

    const n = this.numeroParcelas();
    const total = this.valorTotalRaw()!;
    const valoresParcelas = this.calcularValoresParcelas(total, n);

    this.salvando.set(true);

    const request = {
      fazendaId: this.context.fazendaId,
      veiculoId: this.tipoAtivo() === 'VEICULO' ? this.ativoId()! : undefined,
      equipamentoId: this.tipoAtivo() === 'EQUIPAMENTO' ? this.ativoId()! : undefined,
      tipo: this.tipoSelecionado(),
      descricao: this.form.value.descricao || undefined,
      kmAtual: this.tipoAtivo() === 'VEICULO' ? this.kmAtualRaw() ?? undefined : undefined,
      observacao: this.form.value.observacao || undefined,
      fornecedorId: this.fornecedorId()!,
      negocioId: negocioId ?? undefined,
      safraId: safraId ?? undefined,
      projetoId: projetoId ?? undefined,
      primeiraDataVencimento: (this.form.value.primeiraDataVencimento as Date).toISOString().split('T')[0],
      valoresParcelas,
    };

    this.manutencaoParceladaService.salvar(request).subscribe({
      next: () => {
        this.toastService.showSuccess('Sucesso', 'Manutenção parcelada registrada com sucesso!');
        this.salvando.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', 'Não foi possível salvar a manutenção parcelada');
      },
    });
  }

  private calcularValoresParcelas(total: number, n: number): number[] {
    const valorBase = Math.floor((total / n) * 100) / 100;
    const valores = new Array(n).fill(valorBase);
    const somaBase = valorBase * n;
    const resto = Math.round((total - somaBase) * 100) / 100;
    valores[n - 1] = Math.round((valores[n - 1] + resto) * 100) / 100;
    return valores;
  }
}