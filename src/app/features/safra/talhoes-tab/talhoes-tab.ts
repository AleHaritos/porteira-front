import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ITalhao } from '../../../shared/intefaces/ITalhao';
import { NovoTalhao } from '../novo-talhao/novo-talhao';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { CustoTalhaoCard } from '../custo-talhao-card/custo-talhao-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-talhoes-tab',
  imports: [CommonModule ,HlmTableImports, HlmPaginationImports, HlmButtonImports, HlmDropdownMenuImports, NgIcon, CustoTalhaoCard],
  providers: [provideIcons({ lucideEllipsisVertical, lucidePlus })],
  styleUrl: './talhoes-tab.css',
  templateUrl: './talhoes-tab.html',
})
export class TalhoesTab implements OnInit {
  private talhaoService = inject(TalhaoService);
  private dialogService = inject(HlmDialogService);

  safraId = input.required<number>();

  talhoes = signal<ITalhao[]>([]);
  talhaoSelecionado = signal<ITalhao | null>(null);
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
    this.talhaoService.buscarTalhaoPorSafra(this.safraId(), this.paginaAtual(), 7).subscribe({
      next: (res) => {
        this.talhoes.set(res.content);
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

  selecionar(talhao: ITalhao) {
    const jaSelecionado = this.talhaoSelecionado()?.id === talhao.id;
    this.talhaoSelecionado.set(jaSelecionado ? null : talhao);
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
}