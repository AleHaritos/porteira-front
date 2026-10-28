import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical, lucideHousePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { IFazenda } from '../../../shared/interfaces/IFazenda';

@Component({
  selector: 'app-fazenda-table',
  imports: [HlmTableImports, HlmDropdownMenuImports, HlmButtonImports, HlmPaginationImports, NgIcon],
  providers: [provideIcons({ lucideEllipsisVertical })],
  templateUrl: './fazenda-table.html',
  styleUrl: './fazenda-table.css',
})
export class FazendaTable {
 fazendas = input.required<IFazenda[]>();
  paginaAtual = input.required<number>();
  totalPaginas = input.required<number>();

  editar = output<IFazenda>();
  compartilhar = output<IFazenda>();
  excluir = output<IFazenda>();
  verDetalhes = output<IFazenda>();
  mudarPagina = output<number>();

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

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.mudarPagina.emit(pagina);
  }
}
