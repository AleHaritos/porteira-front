import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWarehouse } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { EstoqueService } from '../../../core/services/estoque/estoque-service';
import { ICompraEstoque, IProdutoEstoque, IUsoEstoque } from '../../../shared/interfaces/IProdutoEstoque';

interface ProdutoEstoqueDetalhesContext {
  produto: IProdutoEstoque;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numeroFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

@Component({
  selector: 'app-produto-estoque-detalhes',
  imports: [HlmDialogImports, HlmButtonImports, HlmTableImports, HlmPaginationImports, DatePipe, NgIcon],
  providers: [provideIcons({ lucideWarehouse })],
  styleUrl: './produto-estoque-detalhes.css',
  templateUrl: './produto-estoque-detalhes.html',
})
export class ProdutoEstoqueDetalhes implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<ProdutoEstoqueDetalhesContext>();
  private estoqueService = inject(EstoqueService);

  private readonly tamanhoPagina = 5;

  compras = signal<ICompraEstoque[]>([]);
  usos = signal<IUsoEstoque[]>([]);
  carregandoHistorico = signal(false);

  paginaCompras = signal(0);
  paginaUsos = signal(0);

  readonly formatarValor = (valor: number) => moeda.format(valor);
  readonly formatarQuantidade = (valor: number) => numeroFormatter.format(valor);

  totalPaginasCompras = computed(() => Math.ceil(this.compras().length / this.tamanhoPagina));
  comprasPaginadas = computed(() => {
    const inicio = this.paginaCompras() * this.tamanhoPagina;
    return this.compras().slice(inicio, inicio + this.tamanhoPagina);
  });
  paginasVisiveisCompras = computed(() => this.calcularPaginasVisiveis(this.paginaCompras(), this.totalPaginasCompras()));

  totalPaginasUsos = computed(() => Math.ceil(this.usos().length / this.tamanhoPagina));
  usosPaginados = computed(() => {
    const inicio = this.paginaUsos() * this.tamanhoPagina;
    return this.usos().slice(inicio, inicio + this.tamanhoPagina);
  });
  paginasVisiveisUsos = computed(() => this.calcularPaginasVisiveis(this.paginaUsos(), this.totalPaginasUsos()));

  ngOnInit(): void {
    this.carregarHistorico();
  }

  carregarHistorico(): void {
    const produtoId = this.context.produto.id;
    this.carregandoHistorico.set(true);

    this.estoqueService.listarCompras(produtoId).subscribe({
      next: (compras) => this.compras.set(compras),
    });

    this.estoqueService.listarUsos(produtoId).subscribe({
      next: (usos) => {
        this.usos.set(usos);
        this.carregandoHistorico.set(false);
      },
      error: () => this.carregandoHistorico.set(false),
    });
  }

  irParaCompras(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginasCompras() - 1) return;
    this.paginaCompras.set(pagina);
  }

  irParaUsos(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginasUsos() - 1) return;
    this.paginaUsos.set(pagina);
  }

  fechar(): void {
    this.dialogRef.close();
  }

  private calcularPaginasVisiveis(atual: number, total: number): number[] {
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
  }
}