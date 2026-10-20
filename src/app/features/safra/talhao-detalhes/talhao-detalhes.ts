import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideLandPlot, lucideCalculator } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { TransacoesService } from '../../../core/services/transacoes-service';
import { ITalhao } from '../../../shared/interfaces/ITalhao';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { CustoTalhaoCard } from '../custo-talhao-card/custo-talhao-card';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-talhao-detalhes',
  imports: [HlmButtonImports, NgIcon, CustoTalhaoCard],
  providers: [provideIcons({ lucideArrowLeft, lucideLandPlot, lucideCalculator })],
  styleUrl: './talhao-detalhes.css',
  templateUrl: './talhao-detalhes.html',
})
export class TalhaoDetalhes implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private talhaoService = inject(TalhaoService);
  private safraService = inject(SafraService);
  private transacoesService = inject(TransacoesService);

  fazendaId!: number;
  safraId!: number;
  talhaoId!: number;

  talhao = signal<ITalhao | null>(null);
  safra = signal<ISafra | null>(null);
  custoTotalSafra = signal<number>(0);
  carregando = signal(false);

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

    this.transacoesService.buscarResumoPorSafra(this.safraId, null, null).subscribe({
      next: (resumo) => {
        this.custoTotalSafra.set(resumo.totalGastos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  voltar(): void {
    this.router.navigate(['/fazenda', this.fazendaId, 'safra', this.safraId]);
  }
}