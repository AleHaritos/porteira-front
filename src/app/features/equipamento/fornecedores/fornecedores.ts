import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IFornecedor } from '../../../shared/interfaces/IFornecedor';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { FornecedorService } from '../../../core/services/equipamento/fornecedor-service';
import { ToastService } from '../../../core/services/toast-service';
import { NovoFornecedor } from '../novo-fornecedor/novo-fornecedor';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';

@Component({
  selector: 'app-fornecedores',
  imports: [CommonModule, HlmTableImports, HlmPaginationImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus })],
  styleUrl: './fornecedores.css',
  templateUrl: './fornecedores.html',
})
export class Fornecedores implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fornecedorService = inject(FornecedorService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  fornecedores = signal<IFornecedor[]>([]);
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
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.paginaAtual.set(0);
      this.carregar();
    });
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.fornecedorService.listarPaginado(fazendaId, this.paginaAtual(), 10).subscribe({
      next: (res) => {
        this.fornecedores.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os fornecedores');
      },
    });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovoFornecedor(): void {
    const dialogRef = this.dialogService.open(NovoFornecedor, {
      context: { fazendaId: this.fazendaId() },
      contentClass: 'sm:!max-w-[750px], sm:!min-w-[500px]',
    });
    dialogRef.closed$.subscribe((sucesso) => {
      if (sucesso) {
        this.toastService.showSuccess('Sucesso', 'Fornecedor cadastrado com sucesso');
        this.carregar();
      }
    });
  }

  abrirDetalhesFornecedor(fornecedor: IFornecedor): void {
    this.router.navigate(['/fazenda', this.fazendaId(), 'fornecedores', fornecedor.id]);
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}