import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFuel, lucideWarehouse, lucideHandshake } from '@ng-icons/lucide';
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
import { AbastecimentoService } from '../../../core/services/veiculos/abastecimento-service';
import { PostoService } from '../../../core/services/veiculos/posto-service';
import { VeiculoService } from '../../../core/services/veiculos/veiculo-service';
import { TipoCombustivel, LocalAbastecimento } from '../../../shared/interfaces/IAbastecimento';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { IPosto } from '../../../shared/interfaces/IPosto';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { IProjeto } from '../../../shared/interfaces/IProjeto';
import { IVeiculo } from '../../../shared/interfaces/IVeiculos';
import { ProjetoService } from '../../../core/services/projeto/projeto-service';

type Vinculo = 'NEGOCIO' | 'SAFRA' | 'PROJETO';

interface AbastecimentoDialogContext {
  fazendaId: number;
  veiculoId: number;
  veiculoNome: string;
}

@Component({
  selector: 'app-novo-abastecimento',
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
  providers: [provideIcons({ lucideFuel, lucideWarehouse, lucideHandshake })],
  styleUrl: './novo-abastecimento.css',
  templateUrl: './novo-abastecimento.html',
})
export class NovoAbastecimento implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<AbastecimentoDialogContext>();
  private fb = inject(FormBuilder);
  private abastecimentoService = inject(AbastecimentoService);
  private veiculoService = inject(VeiculoService);
  private postoService = inject(PostoService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private projetoService = inject(ProjetoService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  veiculos = signal<IVeiculo[]>([]);
  veiculoSelecionadoId = signal<number | null>(this.context.veiculoId);

  veiculoSelecionado = computed(() => this.veiculos().find((v) => v.id === this.veiculoSelecionadoId()) ?? null);
  headerSubtitulo = computed(() => this.veiculoSelecionado()?.nome ?? this.context.veiculoNome);

  itemToStringVeiculo = (value: number | null | undefined) => {
    const veiculo = this.veiculos().find((v) => v.id === value);
    return veiculo ? `${veiculo.nome} (${veiculo.placa})` : '';
  };

  tipoCombustivel = signal<TipoCombustivel>('DIESEL');
  localAbastecimento = signal<LocalAbastecimento>('POSTO_CASUAL');

  tipoCombustivelOptions: { value: TipoCombustivel; label: string }[] = [
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'GASOLINA', label: 'Gasolina' },
    { value: 'ETANOL', label: 'Etanol' },
  ];

  itemToStringTipoCombustivel = (value: TipoCombustivel | null | undefined) =>
    this.tipoCombustivelOptions.find((o) => o.value === value)?.label || '';

  litrosRaw = signal<number | null>(null);
  valorPorLitroRaw = signal<number | null>(null);

  postos = signal<IPosto[]>([]);
  postoSelecionadoId = signal<number | null>(null);

  itemToStringPosto = (value: number | null | undefined) =>
    this.postos().find((p) => p.id === value)?.nome || '';

  vinculo = signal<Vinculo>('NEGOCIO');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  projetos = signal<IProjeto[]>([]);
  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);
  projetoSelecionado = signal<number | null>(null);

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  itemToStringProjeto = (value: number | null | undefined) =>
    this.projetos().find((p) => p.id === value)?.nome || '';

  form = this.fb.group({
    data: [new Date() as Date | null, Validators.required],
    observacao: [''],
  });

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;

    this.veiculoService.buscarPorFazenda(fazendaId, 0, 100).subscribe({
      next: (res) => this.veiculos.set(res.content),
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar os veículos'),
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

    this.postoService.listarPorFazenda(fazendaId).subscribe({
      next: (postos) => this.postos.set(postos),
    });
  }

  onVeiculoChange(id: number | null | undefined) {
    this.veiculoSelecionadoId.set(id ?? null);
  }

  onTipoCombustivelChange(tipo: TipoCombustivel | null | undefined) {
    if (tipo) this.tipoCombustivel.set(tipo);
  }

  onLocalChange(local: LocalAbastecimento) {
    this.localAbastecimento.set(local);
    if (local !== 'POSTO_CREDENCIADO') this.postoSelecionadoId.set(null);
    if (local === 'ESTOQUE_FAZENDA') this.valorPorLitroRaw.set(null);
  }

  onPostoChange(id: number | null | undefined) {
    this.postoSelecionadoId.set(id ?? null);
  }

  onVinculoChange(vinculo: Vinculo) {
    this.vinculo.set(vinculo);
    this.negocioSelecionado.set(null);
    this.safraSelecionada.set(null);
    this.projetoSelecionado.set(null);
  }

  onNegocioChange(id: number | null | undefined) {
    this.negocioSelecionado.set(id ?? null);
  }

  onSafraChange(id: number | null | undefined) {
    this.safraSelecionada.set(id ?? null);
  }

  onProjetoChange(id: number | null | undefined) {
    this.projetoSelecionado.set(id ?? null);
  }

  onLitrosInput(valor: string) {
    const normalizado = valor.replace(',', '.').replace(/[^0-9.]/g, '');
    this.litrosRaw.set(normalizado ? Number(normalizado) : null);
  }

  onValorPorLitroInput(valor: string) {
    const digitos = valor.replace(/\D/g, '');
    this.valorPorLitroRaw.set(digitos ? Number(digitos) / 1000 : null);
  }

  formatarValorPorLitroDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
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

    const veiculoId = this.veiculoSelecionadoId();
    if (veiculoId == null) {
      this.toastService.showError('Erro', 'Selecione o veículo');
      return;
    }

    const litros = this.litrosRaw();
    if (!litros || litros <= 0) {
      this.toastService.showError('Erro', 'Informe a quantidade de litros');
      return;
    }

    const local = this.localAbastecimento();

    if (local !== 'ESTOQUE_FAZENDA') {
      const valorPorLitro = this.valorPorLitroRaw();
      if (!valorPorLitro || valorPorLitro <= 0) {
        this.toastService.showError('Erro', 'Informe o valor por litro');
        return;
      }
    }

    if (local === 'POSTO_CREDENCIADO' && this.postoSelecionadoId() == null) {
      this.toastService.showError('Erro', 'Selecione o posto credenciado');
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

    const { data, observacao } = this.form.value;

    this.salvando.set(true);
    this.abastecimentoService
      .salvar({
        veiculoId,
        data: this.formatarDataIso(data!),
        litros,
        valorPorLitro: local === 'ESTOQUE_FAZENDA' ? null : this.valorPorLitroRaw(),
        tipoCombustivel: this.tipoCombustivel(),
        localAbastecimento: local,
        postoId: local === 'POSTO_CREDENCIADO' ? this.postoSelecionadoId() : null,
        observacao: observacao || undefined,
        fazendaId: this.context.fazendaId,
        negocioId: negocioId ?? undefined,
        safraId: safraId ?? undefined,
        projetoId: projetoId ?? undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Abastecimento registrado com sucesso!');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.salvando.set(false);
          let mensagem = err?.error?.message || 'Não foi possível registrar o abastecimento';
          if (local == 'ESTOQUE_FAZENDA') {
            mensagem = "Verifique o estoque da fazenda!"
          }
          this.toastService.showError('Erro', mensagem);
        },
      });
  }
}