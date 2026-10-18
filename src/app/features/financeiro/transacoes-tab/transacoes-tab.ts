import { Component, Input, OnChanges, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucidePencil, lucideTrash2, lucideTrendingUp, lucideTrendingDown, lucideSearch } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { TransacoesService } from '../../../core/services/transacoes-service';
import { ToastService } from '../../../core/services/toast-service';
import { ITransacao, TipoTransacao } from '../../../shared/interfaces/ITransacao';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { NovaTransacao } from '../nova-transacao/nova-transacao';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { TruncarPipe } from '../../../shared/pipes/TruncarPipe';

type VinculoFiltro = 'TODOS' | 'NEGOCIO' | 'SAFRA';

@Component({
  selector: 'app-transacoes-tab',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmTableImports,
    HlmPaginationImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmDatePickerImports,
    HlmLabelImports,
    NgIcon,
    DatePipe,
    TruncarPipe,
  ],
  providers: [
    provideIcons({ lucidePlus, lucidePencil, lucideTrash2, lucideTrendingUp, lucideTrendingDown, lucideSearch }),
  ],
  styleUrl: './transacoes-tab.css',
  templateUrl: './transacoes-tab.html',
})
export class TransacoesTab implements OnInit, OnChanges {
  @Input({ required: true }) fazendaId!: number;

  private fb = inject(FormBuilder);
  private transacoesService = inject(TransacoesService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  transacoes = signal<ITransacao[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  tipoFiltro = signal<TipoTransacao | 'TODOS'>('TODOS');
  maxDate = new Date();

  vinculoFiltro = signal<VinculoFiltro>('TODOS');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  negocioFiltroId = signal<number | null>(null);
  safraFiltroId = signal<number | null>(null);

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  filtroForm = this.fb.group({
    dataInicio: [null as Date | null],
    dataFim: [null as Date | null],
  });

  tipoFiltroOptions: { value: TipoTransacao | null; label: string }[] = [
    { value: null, label: 'Todos' },
    { value: 'RECEITA', label: 'Receita' },
    { value: 'GASTO', label: 'Gasto' },
  ];

  itemToStringTipoFiltro = (value: TipoTransacao | 'TODOS' | null | undefined) =>
    this.tipoFiltroOptions.find((o) => o.value === value)?.label || 'Todos';

  paginasVisiveis = computed(() => {
    const atual = this.paginaAtual();
    const total = this.totalPaginas();
    const inicio = Math.max(0, atual - 1);
    const fim = Math.min(total - 1, atual + 1);
    const paginas: number[] = [];
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
  });

  ngOnInit(): void {
    this.carregarVinculos();
    this.carregar();
  }

  ngOnChanges(): void {
    this.carregarVinculos();
    this.paginaAtual.set(0);
    this.carregar();
  }

  private carregarVinculos(): void {
    if (this.fazendaId == null) return;

    this.negocioService.listarTodosPorFazenda(this.fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(this.fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });
  }

  onTipoFiltroChange(tipo: TipoTransacao | 'TODOS' | null | undefined) {
    this.tipoFiltro.set(tipo ?? 'TODOS');
  }

  onVinculoFiltroChange(vinculo: VinculoFiltro) {
    this.vinculoFiltro.set(vinculo);
    this.negocioFiltroId.set(null);
    this.safraFiltroId.set(null);
  }

  onNegocioFiltroChange(id: number | null | undefined) {
    this.negocioFiltroId.set(id ?? null);
  }

  onSafraFiltroChange(id: number | null | undefined) {
    this.safraFiltroId.set(id ?? null);
  }

  pesquisar() {
    this.paginaAtual.set(0);
    this.carregar();
  }

  limparFiltros() {
    this.tipoFiltro.set('TODOS');
    this.filtroForm.reset({ dataInicio: null, dataFim: null });
    this.vinculoFiltro.set('TODOS');
    this.negocioFiltroId.set(null);
    this.safraFiltroId.set(null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  carregar() {
    if (this.fazendaId == null) return;

    const { dataInicio, dataFim } = this.filtroForm.value;
    const tipo = this.tipoFiltro();
    const vinculo = this.vinculoFiltro();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioFiltroId() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraFiltroId() : null;

    this.carregando.set(true);
    this.transacoesService
      .buscarPorFazenda(
        this.fazendaId,
        this.paginaAtual(),
        6,
        dataInicio ? this.formatarDataIso(dataInicio) : null,
        dataFim ? this.formatarDataIso(dataFim) : null,
        tipo === 'TODOS' ? null : tipo,
        negocioId,
        safraId,
      )
      .subscribe({
        next: (res) => {
          this.transacoes.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar as transações');
        },
      });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovaTransacao() {
    if (this.fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaTransacao, {
      context: { fazendaId: this.fazendaId },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((criada) => {
      if (criada) this.carregar();
    });
  }

  editar(transacao: ITransacao) {
    if (this.fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaTransacao, {
      context: { fazendaId: this.fazendaId, transacao },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((atualizada) => {
      if (atualizada) this.carregar();
    });
  }

  excluir(transacao: ITransacao) {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir transação',
        mensagem: `Tem certeza que deseja excluir a transação "${transacao.descricao || this.tipoLabel(transacao.tipo)}"? Essa ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.transacoesService.desativar(transacao.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Transação excluída com sucesso!');
            this.carregar();
          },
          error: () => {
            this.toastService.showError('Erro', 'Não foi possível excluir a transação');
          },
        });
      }
    });
  }

  tipoOptions: { value: TipoTransacao; label: string }[] = [
    { value: 'RECEITA', label: 'Receita' },
    { value: 'GASTO', label: 'Gasto' },
  ];

  tipoClasse(tipo: string): string {
    const classes: Record<string, string> = {
      RECEITA: 'fazenda-table__badge--receita',
      GASTO: 'fazenda-table__badge--gasto',
    };
    return classes[tipo] || '';
  }

  tipoLabel(tipo: string): string {
    return this.tipoOptions.find((o) => o.value === tipo)?.label || tipo;
  }

  vinculo(transacao: ITransacao): string {
    return transacao.negocioNome ?? transacao.safraNome ?? '-';
  }

  valorClasse(tipo: string): string {
    return tipo === 'RECEITA' ? 'financeiro-table__valor--receita' : 'financeiro-table__valor--gasto';
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}