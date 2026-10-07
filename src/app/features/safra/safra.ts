import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical, lucidePlus, lucideSearch } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ISafra, StatusSafra } from '../../shared/intefaces/ISafras';
import { CommonModule } from '@angular/common';
import { NovaSafra } from './nova-safra/nova-safra';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { SafraService } from '../../core/services/safra/safra-service';

@Component({
  selector: 'app-safra',
  imports: [
    CommonModule,
    FormsModule,
    HlmTableImports,
    HlmPaginationImports,
    HlmInputImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    NgIcon,
    RouterLinkWithHref
],
  providers: [provideIcons({ lucideEllipsisVertical, lucideSearch, lucidePlus })],
  styleUrl: './safra.css',
  templateUrl: './safra.html',
})
export class Safra implements OnInit {
  private safraService = inject(SafraService);
  private route = inject(ActivatedRoute);
  private dialogService = inject(HlmDialogService);
  private router = inject(Router);

  private fazendaId!: number;

  safras = signal<ISafra[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);
  anoAgricola = signal('');

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
    const id = this.route.parent?.snapshot.paramMap.get('id');
    this.fazendaId = Number(id);
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.safraService.buscarSafrasPorFazenda(this.fazendaId, this.paginaAtual(), 10, this.anoAgricola() || undefined)
      .subscribe({
        next: (res) => {
          this.safras.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
  }

  pesquisar() {
    this.paginaAtual.set(0);
    this.carregar();
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  statusLabel(status: StatusSafra): string {
    const labels: Record<StatusSafra, string> = {
      PLANEJAMENTO: 'Planejamento',
      EM_ANDAMENTO: 'Em andamento',
      COLHEITA: 'Colheita',
      ENCERRADO: 'Encerrado',
    };
    return labels[status];
  }

  abrirNovaSafra() {
    const dialogRef = this.dialogService.open(NovaSafra, {
      context: { fazendaId: this.fazendaId },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((safraCriada) => {
      if (safraCriada) {
        this.carregar();
      }
    });
  }

  statusClasse(status: StatusSafra): string {
    const classes: Record<StatusSafra, string> = {
      PLANEJAMENTO: 'safra-table__badge--planejamento',
      EM_ANDAMENTO: 'safra-table__badge--andamento',
      COLHEITA: 'safra-table__badge--colheita',
      ENCERRADO: 'safra-table__badge--encerrado',
    };
    return classes[status];
  }

  verDetalhes(id: number) {
    this.router.navigate(['safra', id], { relativeTo: this.route.parent });
  }
}