import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideCheck, lucideTrendingUp, lucideTrendingDown } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { TruncarPipe } from '../../../shared/pipes/TruncarPipe';
import { ContasPendentesService } from '../../../core/services/contas-pendentes-service';
import { ToastService } from '../../../core/services/toast-service';
import { IParcelaContaPendente, StatusParcela } from '../../../shared/interfaces/IContaPendente';
import { TipoTransacao } from '../../../shared/interfaces/ITransacao';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { NovaContaPendente } from '../nova-conta-pendente/nova-conta-pendente';

@Component({
  selector: 'app-contas-pendentes',
  imports: [
    CommonModule,
    HlmTableImports,
    HlmPaginationImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmLabelImports,
    NgIcon,
    DatePipe,
    TruncarPipe,
  ],
  providers: [provideIcons({ lucidePlus, lucideCheck, lucideTrendingUp, lucideTrendingDown })],
  styleUrl: './contas-pendentes.css',
  templateUrl: './contas-pendentes.html',
})
export class ContasPendentes implements OnInit {
  private route = inject(ActivatedRoute);
  private contasPendentesService = inject(ContasPendentesService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  parcelas = signal<IParcelaContaPendente[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  tipoFiltro = signal<TipoTransacao | 'TODOS'>('TODOS');
  statusFiltro = signal<StatusParcela | 'TODOS'>('PENDENTE');

  tipoFiltroOptions: { value: TipoTransacao | null; label: string }[] = [
    { value: null, label: 'Todos' },
    { value: 'RECEITA', label: 'A Receber' },
    { value: 'GASTO', label: 'A Pagar' },
  ];

  statusFiltroOptions: { value: StatusParcela | null; label: string }[] = [
    { value: null, label: 'Todos' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'BAIXADO', label: 'Baixado' },
  ];

  itemToStringTipoFiltro = (value: TipoTransacao | 'TODOS' | null | undefined) =>
    this.tipoFiltroOptions.find((o) => o.value === value)?.label || 'Todos';

  itemToStringStatusFiltro = (value: StatusParcela | 'TODOS' | null | undefined) =>
    this.statusFiltroOptions.find((o) => o.value === value)?.label || 'Todos';

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
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.paginaAtual.set(0);
      this.carregar();
    });
  }

  onTipoFiltroChange(tipo: TipoTransacao | 'TODOS' | null | undefined) {
    this.tipoFiltro.set(tipo ?? 'TODOS');
  }

  onStatusFiltroChange(status: StatusParcela | 'TODOS' | null | undefined) {
    this.statusFiltro.set(status ?? 'TODOS');
  }

  pesquisar() {
    this.paginaAtual.set(0);
    this.carregar();
  }

  limparFiltros() {
    this.tipoFiltro.set('TODOS');
    this.statusFiltro.set('TODOS');
    this.paginaAtual.set(0);
    this.carregar();
  }

  carregar() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const status = this.statusFiltro();
    const tipo = this.tipoFiltro();

    this.carregando.set(true);
    this.contasPendentesService
      .buscarParcelasPorFazenda(
        fazendaId,
        this.paginaAtual(),
        10,
        status === 'TODOS' ? null : status,
        tipo === 'TODOS' ? null : tipo,
      )
      .subscribe({
        next: (res) => {
          this.parcelas.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar as contas pendentes');
        },
      });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovaContaPendente() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaContaPendente, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((criada) => {
      if (criada) this.carregar();
    });
  }

  darBaixa(parcela: IParcelaContaPendente) {
    const acao = parcela.tipo === 'RECEITA' ? 'recebimento' : 'pagamento';

    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: `Confirmar ${acao}`,
        mensagem: `Confirmar o ${acao} da parcela ${parcela.numeroParcela}/${parcela.totalParcelas} de "${parcela.descricao || '-'}" no valor de ${this.formatarValor(parcela.valor)}?`,
        textoConfirmar: 'Confirmar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.contasPendentesService.darBaixa(parcela.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', `Parcela ${parcela.tipo === 'RECEITA' ? 'recebida' : 'paga'} com sucesso!`);
            this.carregar();
          },
          error: () => {
            this.toastService.showError('Erro', 'Não foi possível dar baixa na parcela');
          },
        });
      }
    });
  }

  tipoClasse(tipo: string): string {
    return tipo === 'RECEITA' ? 'fazenda-table__badge--receita' : 'fazenda-table__badge--gasto';
  }

  tipoLabel(tipo: string): string {
    return tipo === 'RECEITA' ? 'A Receber' : 'A Pagar';
  }

  statusClasse(status: string): string {
    return status === 'BAIXADO' ? 'contas-pendentes-page__status--baixado' : 'contas-pendentes-page__status--pendente';
  }

  statusLabel(status: string): string {
    return status === 'BAIXADO' ? 'Baixado' : 'Pendente';
  }

  vinculo(parcela: IParcelaContaPendente): string {
    return parcela.negocioNome ?? parcela.safraNome ?? '-';
  }

  valorClasse(tipo: string): string {
    return tipo === 'RECEITA' ? 'financeiro-table__valor--receita' : 'financeiro-table__valor--gasto';
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}