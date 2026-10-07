import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical, lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ProdutoSafraService } from '../../../core/services/safra/produto-safra-service';
import { IProdutoSafra } from '../../../shared/intefaces/IProdutoSafra';
import { NovoProduto } from '../novo-produto/novo-produto';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-produtos-tab',
  imports: [HlmTableImports, HlmPaginationImports, HlmButtonImports, HlmDropdownMenuImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideEllipsisVertical, lucidePencil, lucideTrash2 })],
  styleUrl: './produtos-tab.css',
  templateUrl: './produtos-tab.html',
})
export class ProdutosTab implements OnInit {
  private produtoSafraService = inject(ProdutoSafraService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  safraId = input.required<number>();

  produtos = signal<IProdutoSafra[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

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
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.produtoSafraService.buscarPorSafra(this.safraId(), this.paginaAtual(), 7).subscribe({
      next: (res) => {
        this.produtos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovoProduto() {
    const dialogRef = this.dialogService.open(NovoProduto, {
      context: { safraId: this.safraId() },
      contentClass: 'sm:!max-w-[700px], sm:!min-w-[450px]',
    });

    dialogRef.closed$.subscribe((produtoCriado) => {
      if (produtoCriado) {
        this.carregar();
      }
    });
  }

  editar(produto: IProdutoSafra) {
    const dialogRef = this.dialogService.open(NovoProduto, {
      context: { safraId: this.safraId(), produto },
    });

    dialogRef.closed$.subscribe((produtoAtualizado) => {
      if (produtoAtualizado) {
        this.carregar();
      }
    });
  }

  excluir(produto: IProdutoSafra) {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir produto',
        mensagem: `Tem certeza que deseja excluir "${produto.nome}"? Essa ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.produtoSafraService.excluir(produto.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Produto excluído com sucesso!');
            this.carregar();
          }
        });
      }
    });
  }
}
