import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideLandPlot, lucideCalculator, lucideWallet, lucideFuel } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { TransacoesService } from '../../../core/services/transacoes-service';
import { CustoFixoTalhaoService } from '../../../core/services/safra/custo-fixo-talhao-service';
import { CustoCategoriaSafraService } from '../../../core/services/safra/custo-categoria-safra-service';
import { ITalhao } from '../../../shared/interfaces/ITalhao';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { ICustoFixoTalhao } from '../../../shared/interfaces/ICustoFixoTalhao';
import { CustoTalhaoCard } from '../custo-talhao-card/custo-talhao-card';
import { CustosFixosTalhaoTab } from '../custos-fixos-talhao-tab/custos-fixos-talhao-tab';
import { ICustosCombustivelManutencao } from '../../../shared/interfaces/ICustosCombustivelManutencao';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type AbaTalhao = 'resumo' | 'manejos' | 'custosFixos';

@Component({
  selector: 'app-talhao-detalhes',
  imports: [HlmButtonImports, HlmTabsImports, NgIcon, CustoTalhaoCard, CustosFixosTalhaoTab],
  providers: [provideIcons({ lucideArrowLeft, lucideLandPlot, lucideCalculator, lucideWallet, lucideFuel })],
  styleUrl: './talhao-detalhes.css',
  templateUrl: './talhao-detalhes.html',
})
export class TalhaoDetalhes implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private talhaoService = inject(TalhaoService);
  private safraService = inject(SafraService);
  private transacoesService = inject(TransacoesService);
  private custoFixoTalhaoService = inject(CustoFixoTalhaoService);
  private custoCategoriaSafraService = inject(CustoCategoriaSafraService);

  fazendaId!: number;
  safraId!: number;
  talhaoId!: number;

  talhao = signal<ITalhao | null>(null);
  safra = signal<ISafra | null>(null);
  custoTotalSafra = signal<number>(0);
  custosFixos = signal<ICustoFixoTalhao[]>([]);
  custosCombustivelManutencao = signal<ICustosCombustivelManutencao | null>(null);
  carregando = signal(false);

  abaAtiva = signal<AbaTalhao>('resumo');

  proporcaoArea = computed(() => {
    const talhao = this.talhao();
    const safra = this.safra();
    if (!talhao || !safra || !safra.areaTotal) return 0;
    return talhao.areaHectares / safra.areaTotal;
  });

  custoEstimadoTalhao = computed(() => this.custoTotalSafra() * this.proporcaoArea());

  custoPorHectare = computed(() => {
    const talhao = this.talhao();
    if (!talhao || !talhao.areaHectares) return 0;
    return this.custoEstimadoTalhao() / talhao.areaHectares;
  });

  totalCustosFixos = computed(() => this.custosFixos().reduce((soma, c) => soma + c.valor, 0));
  custosFixosPreview = computed(() => this.custosFixos().slice(0, 5));

  custoCombustivelEstimado = computed(
    () => (this.custosCombustivelManutencao()?.totalCombustivel ?? 0) * this.proporcaoArea(),
  );
  custoManutencaoEstimado = computed(
    () => (this.custosCombustivelManutencao()?.totalManutencao ?? 0) * this.proporcaoArea(),
  );

  custoCombustivelPorHa = computed(() => {
    const talhao = this.talhao();
    if (!talhao || !talhao.areaHectares) return 0;
    return this.custoCombustivelEstimado() / talhao.areaHectares;
  });

  custoManutencaoPorHa = computed(() => {
    const talhao = this.talhao();
    if (!talhao || !talhao.areaHectares) return 0;
    return this.custoManutencaoEstimado() / talhao.areaHectares;
  });

  readonly formatarValor = (valor: number) => moeda.format(valor);

  ngOnInit(): void {
    this.fazendaId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.safraId = Number(this.route.snapshot.paramMap.get('safraId'));
    this.talhaoId = Number(this.route.snapshot.paramMap.get('talhaoId'));

    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);

    this.talhaoService.listarTodosPorSafra(this.safraId).subscribe({
      next: (talhoes) => {
        this.talhao.set(talhoes.find((t) => t.id === this.talhaoId) ?? null);
      },
    });

    this.safraService.buscarPorId(this.safraId).subscribe({
      next: (safra) => this.safra.set(safra),
    });

    this.custoFixoTalhaoService.listarPorTalhao(this.talhaoId).subscribe({
      next: (custos) => this.custosFixos.set(custos),
    });

    this.custoCategoriaSafraService.buscar(this.safraId).subscribe({
      next: (dados) => this.custosCombustivelManutencao.set(dados),
    });

    this.transacoesService.buscarResumoPorSafra(this.safraId, null, null).subscribe({
      next: (resumo) => {
        this.custoTotalSafra.set(resumo.totalGastos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  selecionarAba(aba: AbaTalhao): void {
    this.abaAtiva.set(aba);
  }

  voltar(): void {
    this.router.navigate(['/fazenda', this.fazendaId, 'safra', this.safraId]);
  }
}