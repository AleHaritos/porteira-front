import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ITalhao, StatusTalhao } from '../../../shared/interfaces/ITalhao';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { NovoTalhao } from '../novo-talhao/novo-talhao';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { TransacoesService } from '../../../core/services/transacoes-service';
import { CustoFixoTalhaoService } from '../../../core/services/safra/custo-fixo-talhao-service';
import { ManejoService } from '../../../core/services/safra/manejo-service';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_TALHAO_LABEL: Record<StatusTalhao, string> = {
  PREPARO_DO_SOLO: 'Preparo do Solo',
  PLANTIO: 'Plantio',
  ADUBACAO: 'Adubação',
  PULVERIZACAO: 'Pulverização',
  IRRIGACAO: 'Irrigação',
  COLHEITA: 'Colheita',
  OUTRO: 'Outro',
};

const STATUS_TALHAO_CLASSE: Record<StatusTalhao, string> = {
  PREPARO_DO_SOLO: 'talhoes-table__badge-etapa--preparo-do-solo',
  PLANTIO: 'talhoes-table__badge-etapa--plantio',
  ADUBACAO: 'talhoes-table__badge-etapa--adubacao',
  PULVERIZACAO: 'talhoes-table__badge-etapa--pulverizacao',
  IRRIGACAO: 'talhoes-table__badge-etapa--irrigacao',
  COLHEITA: 'talhoes-table__badge-etapa--colheita',
  OUTRO: 'talhoes-table__badge-etapa--outro',
};

@Component({
  selector: 'app-talhoes-tab',
  imports: [CommonModule, HlmTableImports, HlmPaginationImports, HlmButtonImports, HlmDropdownMenuImports, NgIcon],
  providers: [provideIcons({ lucideEllipsisVertical, lucidePlus })],
  styleUrl: './talhoes-tab.css',
  templateUrl: './talhoes-tab.html',
})
export class TalhoesTab implements OnInit {
  private talhaoService = inject(TalhaoService);
  private safraService = inject(SafraService);
  private transacoesService = inject(TransacoesService);
  private custoFixoTalhaoService = inject(CustoFixoTalhaoService);
  private manejoService = inject(ManejoService);
  private dialogService = inject(HlmDialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  safraId = input.required<number>();

  talhoes = signal<ITalhao[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

  safra = signal<ISafra | null>(null);
  custoTotalSafra = signal(0);
  custosPorHectare = signal<Map<number, number>>(new Map());
  carregandoCustos = signal(false);

  readonly formatarMoeda = (valor: number) => moeda.format(valor);
  readonly statusTalhaoLabel = STATUS_TALHAO_LABEL;
  readonly statusTalhaoClasse = STATUS_TALHAO_CLASSE;


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

  ngOnInit(): void {
    forkJoin({
      safra: this.safraService.buscarPorId(this.safraId()),
      resumo: this.transacoesService.buscarResumoPorSafra(this.safraId(), null, null),
    }).subscribe({
      next: ({ safra, resumo }) => {
        this.safra.set(safra);
        this.custoTotalSafra.set(resumo.totalGastos);
        this.carregar();
      },
      error: () => this.carregar(),
    });
  }

  carregar() {
    this.carregando.set(true);
    this.talhaoService.buscarTalhaoPorSafra(this.safraId(), this.paginaAtual(), 7).subscribe({
      next: (res) => {
        this.talhoes.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
        this.carregarCustosPorHectare(res.content);
      },
      error: () => this.carregando.set(false),
    });
  }

  private carregarCustosPorHectare(talhoes: ITalhao[]): void {
    if (talhoes.length === 0) {
      this.custosPorHectare.set(new Map());
      return;
    }

    this.carregandoCustos.set(true);

    const chamadas = talhoes.map((talhao) =>
      forkJoin({
        custosFixos: this.custoFixoTalhaoService.listarPorTalhao(talhao.id).pipe(catchError(() => of([]))),
        manejos: this.manejoService.listarTodosPorTalhao(talhao.id).pipe(catchError(() => of([]))),
      }).pipe(
        map(({ custosFixos, manejos }) => {
          const totalCustosFixos = custosFixos.reduce((soma, c) => soma + c.valor, 0);
          const totalManejos = manejos.reduce((soma, m) => soma + m.custoTotal, 0);

          const areaTotalSafra = this.safra()?.areaTotal ?? 0;
          const proporcaoArea = areaTotalSafra ? talhao.areaHectares / areaTotalSafra : 0;
          const custoEstimado = this.custoTotalSafra() * proporcaoArea;
          const gastosTotalTalhao = custoEstimado + totalCustosFixos + totalManejos;
          const custoPorHectare = talhao.areaHectares ? gastosTotalTalhao / talhao.areaHectares : 0;

          return { talhaoId: talhao.id, custoPorHectare };
        }),
      ),
    );

    forkJoin(chamadas).subscribe({
      next: (resultados) => {
        const mapa = new Map<number, number>();
        resultados.forEach((r) => mapa.set(r.talhaoId, r.custoPorHectare));
        this.custosPorHectare.set(mapa);
        this.carregandoCustos.set(false);
      },
      error: () => this.carregandoCustos.set(false),
    });
  }

  custoPorHectareDoTalhao(talhao: ITalhao): number {
    return this.custosPorHectare().get(talhao.id) ?? 0;
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirDetalhesTalhao(talhao: ITalhao) {
    const fazendaId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.router.navigate(['/fazenda', fazendaId, 'safra', this.safraId(), 'talhao', talhao.id]);
  }

  abrirNovoTalhao() {
    const dialogRef = this.dialogService.open(NovoTalhao, {
      context: { safraId: this.safraId() },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((talhaoCriado) => {
      if (talhaoCriado) {
        this.carregar();
      }
    });
  }

  desativar(talhao: ITalhao) {
    this.talhaoService.desativar(talhao.id).subscribe({
      next: () => this.carregar(),
    });
  }

  reativar(talhao: ITalhao) {
    this.talhaoService.reativar(talhao.id).subscribe({
      next: () => this.carregar(),
    });
  }

  editar(talhao: ITalhao) {
    const dialogRef = this.dialogService.open(NovoTalhao, {
      context: { safraId: this.safraId(), talhao },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((talhaoAtualizado) => {
      if (talhaoAtualizado) {
        this.carregar();
      }
    });
  }
}