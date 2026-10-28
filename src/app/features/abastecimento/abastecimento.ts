import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NegocioService } from '../../core/services/negocio-service';
import { SafraService } from '../../core/services/safra/safra-service';
import { ToastService } from '../../core/services/toast-service';
import { AbastecimentoService } from '../../core/services/veiculos/abastecimento-service';
import { VeiculoService } from '../../core/services/veiculos/veiculo-service';
import { IAbastecimento, IAbastecimentoResumo, LocalAbastecimento, TipoCombustivel } from '../../shared/interfaces/IAbastecimento';
import { INegocio } from '../../shared/interfaces/INegocio';
import { ISafra } from '../../shared/interfaces/ISafras';
import { IVeiculo } from '../../shared/interfaces/IVeiculos';
import { NovoAbastecimento } from './novo-abastecimento/novo-abastecimento';

const TODOS_VEICULOS = -1;
type VinculoFiltro = 'TODOS' | 'NEGOCIO' | 'SAFRA';

@Component({
  selector: 'app-abastecimento',
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    HlmTableImports,
    HlmPaginationImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmLabelImports,
    HlmDatePickerImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideSearch, lucideX })],
  styleUrl: './abastecimento.css',
  templateUrl: './abastecimento.html',
})
export class Abastecimento implements OnInit {
  private route = inject(ActivatedRoute);
  private veiculoService = inject(VeiculoService);
  private abastecimentoService = inject(AbastecimentoService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly TODOS_VEICULOS = TODOS_VEICULOS;

  fazendaId = signal<number | null>(null);

  veiculos = signal<IVeiculo[]>([]);
  veiculoSelecionadoId = signal<number>(TODOS_VEICULOS);

  vinculoFiltro = signal<VinculoFiltro>('TODOS');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  negocioSelecionadoId = signal<number | null>(null);
  safraSelecionadaId = signal<number | null>(null);

  abastecimentos = signal<IAbastecimento[]>([]);
  resumo = signal<IAbastecimentoResumo | null>(null);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  filtroForm = this.fb.group({
    dataInicio: [null as Date | null],
    dataFim: [null as Date | null],
  });

  paginasVisiveis = computed(() => {
    const atual = this.paginaAtual();
    const total = this.totalPaginas();
    const maxBotoes = 5;

    if (total <= maxBotoes) {
      return Array.from({ length: total }, (_, i) => i);
    }

    let inicio = Math.max(0, atual - Math.floor(maxBotoes / 2));
    let fim = inicio + maxBotoes - 1;

    if (fim > total - 1) {
      fim = total - 1;
      inicio = fim - maxBotoes + 1;
    }

    const paginas: number[] = [];
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
  });
  itemToStringVeiculo = (value: number | null | undefined) => {
    if (value == null || value === TODOS_VEICULOS) return 'Todos os veículos';
    const veiculo = this.veiculos().find((v) => v.id === value);
    return veiculo ? `${veiculo.nome} (${veiculo.placa})` : '';
  };

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  localLabels: Record<LocalAbastecimento, string> = {
    ESTOQUE_FAZENDA: 'Estoque da Fazenda',
    POSTO_CREDENCIADO: 'Posto Credenciado',
    POSTO_CASUAL: 'Posto Casual',
  };

  tipoCombustivelLabels: Record<TipoCombustivel, string> = {
    DIESEL: 'Diesel',
    GASOLINA: 'Gasolina',
    ETANOL: 'Etanol',
  };

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregarVeiculos();
      this.carregarVinculos();
      this.carregar();
    });
  }

  carregarVeiculos() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.veiculoService.buscarPorFazenda(fazendaId, 0, 100).subscribe({
      next: (res) => this.veiculos.set(res.content),
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar os veículos'),
    });
  }

  carregarVinculos() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.negocioService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });
  }

  onVeiculoChange(id: number | null | undefined) {
    this.veiculoSelecionadoId.set(id ?? TODOS_VEICULOS);
    this.paginaAtual.set(0);
    this.carregar();
  }

  onVinculoChange(vinculo: VinculoFiltro) {
    this.vinculoFiltro.set(vinculo);
    this.negocioSelecionadoId.set(null);
    this.safraSelecionadaId.set(null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  onNegocioChange(id: number | null | undefined) {
    this.negocioSelecionadoId.set(id ?? null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  onSafraChange(id: number | null | undefined) {
    this.safraSelecionadaId.set(id ?? null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  filtrar() {
    this.paginaAtual.set(0);
    this.carregar();
  }

  limparFiltros() {
    this.filtroForm.reset({ dataInicio: null, dataFim: null });
    this.veiculoSelecionadoId.set(TODOS_VEICULOS);
    this.vinculoFiltro.set('TODOS');
    this.negocioSelecionadoId.set(null);
    this.safraSelecionadaId.set(null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  private formatarDataIso(data: Date | null | undefined): string | undefined {
    if (!data) return undefined;
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  carregar() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const veiculoId = this.veiculoSelecionadoId() === TODOS_VEICULOS ? null : this.veiculoSelecionadoId();
    const { dataInicio, dataFim } = this.filtroForm.value;
    const dataInicioIso = this.formatarDataIso(dataInicio);
    const dataFimIso = this.formatarDataIso(dataFim);

    const vinculo = this.vinculoFiltro();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioSelecionadoId() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraSelecionadaId() : null;

    this.carregando.set(true);
    this.abastecimentoService
      .buscarPorFazenda(fazendaId, this.paginaAtual(), 6, veiculoId, dataInicioIso, dataFimIso, negocioId, safraId)
      .subscribe({
        next: (res) => {
          this.abastecimentos.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar os abastecimentos');
        },
      });

    this.abastecimentoService.buscarResumo(fazendaId, veiculoId, dataInicioIso, dataFimIso, negocioId, safraId).subscribe({
      next: (resumo) => this.resumo.set(resumo),
      error: () => this.resumo.set(null),
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovoAbastecimento() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const veiculoFiltro = this.veiculos().find((v) => v.id === this.veiculoSelecionadoId());
    const veiculo = veiculoFiltro ?? this.veiculos()[0];
    if (!veiculo) {
      this.toastService.showError('Erro', 'Cadastre um veículo antes de registrar abastecimentos');
      return;
    }

    const dialogRef = this.dialogService.open(NovoAbastecimento, {
      context: { fazendaId, veiculoId: veiculo.id, veiculoNome: veiculo.nome },
      contentClass: 'sm:!max-w-[740px]',
    });

    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregar();
    });
  }

  localLabel(local: string): string {
    return this.localLabels[local as LocalAbastecimento] || local;
  }

  tipoCombustivelLabel(tipo: string): string {
    return this.tipoCombustivelLabels[tipo as TipoCombustivel] || tipo;
  }

  localDetalhe(abastecimento: IAbastecimento): string {
    if (abastecimento.localAbastecimento === 'POSTO_CREDENCIADO' && abastecimento.postoNome) {
      return `${this.localLabel(abastecimento.localAbastecimento)} - ${abastecimento.postoNome}`;
    }
    return this.localLabel(abastecimento.localAbastecimento);
  }

  formatarValor(valor: number | null | undefined): string {
    if (valor == null) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}