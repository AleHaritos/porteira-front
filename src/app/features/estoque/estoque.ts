import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWarehouse, lucidePlus, lucideShoppingCart, lucideTrash2, lucidePackageMinus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { EstoqueService } from '../../core/services/estoque/estoque-service';
import { ToastService } from '../../core/services/toast-service';
import { IProdutoEstoque } from '../../shared/interfaces/IProdutoEstoque';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { NovoProdutoEstoque } from './novo-produto-estoque/novo-produto-estoque';
import { ProdutoEstoqueDetalhes } from './produto-estoque-detalhes/produto-estoque-detalhes';
import { RegistrarCompraEstoque } from './registrar-compra-estoque/registrar-compra-estoque';
import { RegistrarUsoEstoque } from './registrar-uso-estoque/registrar-uso-estoque';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numeroFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

@Component({
  selector: 'app-estoque',
  imports: [HlmButtonImports, HlmTableImports, NgIcon],
  providers: [provideIcons({ lucideWarehouse, lucidePlus, lucideShoppingCart, lucidePackageMinus, lucideTrash2 })],
  styleUrl: './estoque.css',
  templateUrl: './estoque.html',
})
export class Estoque implements OnInit {
  private route = inject(ActivatedRoute);
  private estoqueService = inject(EstoqueService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  produtos = signal<IProdutoEstoque[]>([]);
  carregando = signal(false);

  readonly formatarValor = (valor: number) => moeda.format(valor);
  readonly formatarQuantidade = (valor: number) => numeroFormatter.format(valor);

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregar();
    });
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.estoqueService.listarProdutos(fazendaId).subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar o estoque');
      },
    });
  }

  abrirNovoProduto(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoProdutoEstoque, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[600px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregar();
    });
  }

  abrirDetalhes(produto: IProdutoEstoque): void {
    this.dialogService.open(ProdutoEstoqueDetalhes, {
      context: { produto },
      contentClass: 'sm:!max-w-[850px], sm:!min-w-[700px]',
    });
  }

  abrirCompra(produto: IProdutoEstoque, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialogService.open(RegistrarCompraEstoque, {
      context: { produto },
      contentClass: 'sm:!max-w-[700px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  abrirUso(produto: IProdutoEstoque, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialogService.open(RegistrarUsoEstoque, {
      context: { produto },
      contentClass: 'sm:!max-w-[700px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  excluirProduto(produto: IProdutoEstoque, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir produto',
        mensagem: `Tem certeza que deseja excluir "${produto.nome}" do estoque? Essa ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[650px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.estoqueService.excluirProduto(produto.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Produto removido do estoque');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível remover o produto'),
        });
      }
    });
  }
}