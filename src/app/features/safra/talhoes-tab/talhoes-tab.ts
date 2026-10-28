import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ITalhao } from '../../../shared/interfaces/ITalhao';
import { NovoTalhao } from '../novo-talhao/novo-talhao';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-talhoes-tab',
  imports: [CommonModule, HlmTableImports, HlmPaginationImports, HlmButtonImports, HlmDropdownMenuImports, NgIcon],
  providers: [provideIcons({ lucideEllipsisVertical, lucidePlus })],
  styleUrl: './talhoes-tab.css',
  templateUrl: './talhoes-tab.html',
})
export class TalhoesTab implements OnInit {
  private talhaoService = inject(TalhaoService);
  private dialogService = inject(HlmDialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  safraId = input.required<number>();

  talhoes = signal<ITalhao[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);

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