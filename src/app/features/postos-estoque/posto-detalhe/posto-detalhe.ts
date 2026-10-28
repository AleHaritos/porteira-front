import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ToastService } from '../../../core/services/toast-service';
import { AbastecimentoService } from '../../../core/services/veiculos/abastecimento-service';
import { PostoService } from '../../../core/services/veiculos/posto-service';
import { IAbastecimento, TipoCombustivel } from '../../../shared/interfaces/IAbastecimento';
import { IPosto } from '../../../shared/interfaces/IPosto';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { from, concatMap, map, catchError, of } from 'rxjs';

type StatusFiltro = 'TODOS' | 'PENDENTE' | 'BAIXADO';

@Component({
  selector: 'app-posto-detalhe',
  imports: [
    CommonModule, DatePipe, ReactiveFormsModule, HlmTableImports, HlmPaginationImports,
    HlmButtonImports, HlmLabelImports, HlmDatePickerImports, NgIcon,
  ],
  providers: [provideIcons({ lucideArrowLeft })],
  styleUrl: './posto-detalhe.css',
  templateUrl: './posto-detalhe.html',
})
export class PostoDetalhe implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postoService = inject(PostoService);
  private abastecimentoService = inject(AbastecimentoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  postoId = signal<number | null>(null);
  posto = signal<IPosto | null>(null);

  abastecimentos = signal<IAbastecimento[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  selecionados = signal<Set<number>>(new Set());
  pagando = signal(false);

  private hoje = new Date();
  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(new Date(this.hoje.getFullYear(), this.hoje.getMonth(), 1));
  dataFimControl = new FormControl<Date | null>(new Date(this.hoje.getFullYear(), this.hoje.getMonth(), this.hoje.getDate()));
  statusFiltro = signal<StatusFiltro>('TODOS');

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

  tipoCombustivelLabels: Record<TipoCombustivel, string> = {
    DIESEL: 'Diesel',
    GASOLINA: 'Gasolina',
    ETANOL: 'Etanol',
  };

  temPendentes = computed(() => this.abastecimentos().some((a) => a.statusPagamento === 'PENDENTE'));

  todosPendentesSelecionados = computed(() => {
    const pendentes = this.abastecimentos().filter((a) => a.statusPagamento === 'PENDENTE');
    return pendentes.length > 0 && pendentes.every((a) => this.selecionados().has(a.id));
  });

  qtdSelecionados = computed(() => this.selecionados().size);

  valorTotalSelecionado = computed(() => {
    const ids = this.selecionados();
    return this.abastecimentos()
      .filter((a) => ids.has(a.id))
      .reduce((soma, a) => soma + (a.valorTotal ?? 0), 0);
  });

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
    });

    this.route.paramMap.subscribe((params) => {
      const postoId = params.get('postoId');
      this.postoId.set(postoId ? Number(postoId) : null);
      this.carregarPosto();
      this.carregar();
    });

    this.dataInicioControl.valueChanges.subscribe(() => this.filtrar());
    this.dataFimControl.valueChanges.subscribe(() => this.filtrar());
  }

  carregarPosto() {
    const fazendaId = this.fazendaId();
    const postoId = this.postoId();
    if (fazendaId == null || postoId == null) return;

    this.postoService.listarPorFazenda(fazendaId).subscribe({
      next: (postos) => this.posto.set(postos.find((p) => p.id === postoId) ?? null),
    });
  }

  private formatarDataIso(data: Date | null): string | undefined {
    if (!data) return undefined;
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  carregar() {
    const postoId = this.postoId();
    if (postoId == null) return;

    this.limparSelecao();
    this.carregando.set(true);

    const status = this.statusFiltro() === 'TODOS' ? null : this.statusFiltro();
    const dataInicio = this.formatarDataIso(this.dataInicioControl.value);
    const dataFim = this.formatarDataIso(this.dataFimControl.value);

    this.abastecimentoService.buscarPorPosto(postoId, this.paginaAtual(), 10, status, dataInicio, dataFim).subscribe({
      next: (res) => {
        this.abastecimentos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os abastecimentos do posto');
      },
    });
  }

  onStatusFiltroChange(status: StatusFiltro) {
    this.statusFiltro.set(status);
    this.filtrar();
  }

  filtrar() {
    this.paginaAtual.set(0);
    this.carregar();
  }

  limparFiltros() {
    this.dataInicioControl.setValue(null, { emitEvent: false });
    this.dataFimControl.setValue(null, { emitEvent: false });
    this.statusFiltro.set('TODOS');
    this.filtrar();
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  voltar() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;
    this.router.navigate(['/fazenda', fazendaId, 'posto']);
  }

  toggleSelecionado(abastecimento: IAbastecimento) {
    if (abastecimento.statusPagamento !== 'PENDENTE') return;
    const atual = new Set(this.selecionados());
    if (atual.has(abastecimento.id)) atual.delete(abastecimento.id);
    else atual.add(abastecimento.id);
    this.selecionados.set(atual);
  }

  toggleSelecionarTodos() {
    const pendentes = this.abastecimentos().filter((a) => a.statusPagamento === 'PENDENTE');
    if (this.todosPendentesSelecionados()) {
      this.selecionados.set(new Set());
    } else {
      this.selecionados.set(new Set(pendentes.map((a) => a.id)));
    }
  }

  limparSelecao() {
    this.selecionados.set(new Set());
  }

  pagar(abastecimento: IAbastecimento) {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Confirmar pagamento',
        mensagem: `Confirmar o pagamento do abastecimento de ${abastecimento.veiculoNome} em ${this.formatarDataExibicao(abastecimento.data)} no valor de ${this.formatarValor(abastecimento.valorTotal)}?`,
        textoConfirmar: 'Confirmar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.abastecimentoService.darBaixa(abastecimento.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
            this.carregar();
            this.carregarPosto();
          },
          error: () => {
            this.toastService.showError('Erro', 'Não foi possível registrar o pagamento');
          },
        });
      }
    });
  }

  pagarSelecionados() {
    const ids = Array.from(this.selecionados());
    if (ids.length === 0) return;

    const valorTotal = this.valorTotalSelecionado();

    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Confirmar pagamento',
        mensagem: `Confirmar o pagamento de ${ids.length} abastecimento(s) no valor total de ${this.formatarValor(valorTotal)}?`,
        textoConfirmar: 'Confirmar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (!confirmado) return;

      this.pagando.set(true);
      let sucesso = 0;
      let falha = 0;

      from(ids)
        .pipe(
          concatMap((id) =>
            this.abastecimentoService.darBaixa(id).pipe(
              map(() => true),
              catchError(() => of(false)),
            ),
          ),
        )
        .subscribe({
          next: (ok) => (ok ? sucesso++ : falha++),
          complete: () => this.finalizarPagamentoSelecionados(sucesso, falha),
        });
    });
  }

  private finalizarPagamentoSelecionados(sucesso: number, falha: number) {
    this.pagando.set(false);
    this.limparSelecao();
    this.carregar();
    this.carregarPosto();

    if (falha === 0) {
      this.toastService.showSuccess('Sucesso', `${sucesso} pagamento(s) registrado(s) com sucesso!`);
    } else {
      this.toastService.showError('Atenção', `${sucesso} pago(s), ${falha} falharam. Tente novamente.`);
    }
  }

  tipoCombustivelLabel(tipo: string): string {
    return this.tipoCombustivelLabels[tipo as TipoCombustivel] || tipo;
  }

  statusClasse(status: string | null | undefined): string {
    return status === 'BAIXADO' ? 'posto-detalhe__status--baixado' : 'posto-detalhe__status--pendente';
  }

  statusLabel(status: string | null | undefined): string {
    return status === 'BAIXADO' ? 'Pago' : 'Pendente';
  }

  formatarValor(valor: number | null): string {
    if (valor == null) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private formatarDataExibicao(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}