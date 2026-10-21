import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideHandCoins, lucideFuel, lucideChevronRight } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ToastService } from '../../core/services/toast-service';
import { EstoqueCombustivelService } from '../../core/services/veiculos/estoque-combustivel-service';
import { PostoService } from '../../core/services/veiculos/posto-service';
import { TipoCombustivel } from '../../shared/interfaces/IAbastecimento';
import { IEstoqueCombustivel } from '../../shared/interfaces/IEstoqueCombustivel';
import { IPosto } from '../../shared/interfaces/IPosto';
import { ReabastecerEstoque } from './reabastecer-estoque/reabastecer-estoque';
import { NovoPosto } from './novo-posto/novo-posto';

@Component({
  selector: 'app-postos-estoque',
  imports: [CommonModule, HlmTableImports, HlmPaginationImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideHandCoins, lucideFuel, lucideChevronRight })],
  styleUrl: './postos-estoque.css',
  templateUrl: './postos-estoque.html',
})
export class PostosEstoque implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postoService = inject(PostoService);
  private estoqueCombustivelService = inject(EstoqueCombustivelService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  postos = signal<IPosto[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregandoPostos = signal(false);

  estoques = signal<IEstoqueCombustivel[]>([]);
  carregandoEstoques = signal(false);

  tipoCombustivelLabels: Record<TipoCombustivel, string> = {
    DIESEL: 'Diesel',
    GASOLINA: 'Gasolina',
    ETANOL: 'Etanol',
  };

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
      this.carregarPostos();
      this.carregarEstoques();
    });
  }

  carregarPostos() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregandoPostos.set(true);
    this.postoService.listarPaginado(fazendaId, this.paginaAtual(), 6).subscribe({
      next: (res) => {
        this.postos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregandoPostos.set(false);
      },
      error: () => {
        this.carregandoPostos.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os postos');
      },
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregarPostos();
  }

  carregarEstoques() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregandoEstoques.set(true);
    this.estoqueCombustivelService.listarPorFazenda(fazendaId).subscribe({
      next: (estoques) => {
        this.estoques.set(estoques);
        this.carregandoEstoques.set(false);
      },
      error: () => {
        this.carregandoEstoques.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar o estoque de combustível');
      },
    });
  }

  abrirNovoPosto() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoPosto, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[480px]',
    });

    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregarPostos();
    });
  }

  abrirDetalhePosto(posto: IPosto) {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;
    this.router.navigate(['/fazenda', fazendaId, 'posto', posto.id]);
  }

  abrirReabastecerEstoque() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(ReabastecerEstoque, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[520px]',
    });

    dialogRef.closed$.subscribe((reabastecido) => {
      if (reabastecido) this.carregarEstoques();
    });
  }

  tipoCombustivelLabel(tipo: string): string {
    return this.tipoCombustivelLabels[tipo as TipoCombustivel] || tipo;
  }

  formatarValor(valor: number | null): string {
    if (valor == null) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarLitros(valor: number): string {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  }
}