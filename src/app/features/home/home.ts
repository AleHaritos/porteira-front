import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { FazendaService } from '../../core/services/fazenda-service';
import { IFazenda } from '../../shared/intefaces/IFazenda';
import { FazendaTable } from '../fazenda-table/fazenda-table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHousePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { DialogNovaFazenda } from '../dialog-nova-fazenda/dialog-nova-fazenda';

@Component({
  imports: [HlmTabsImports, HlmCardImports, HlmButtonImports, FazendaTable, NgIcon],
  providers: [provideIcons({ lucideHousePlus })],
  selector: 'app-home',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private fazendaService = inject(FazendaService)
  private readonly _hlmDialogService = inject(HlmDialogService);
  fazendas = signal<IFazenda[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);

  ngOnInit(): void {
    this.carregar();
  }

  carregar() {
    this.fazendaService.listarFazendas(this.paginaAtual()).subscribe((res) => {
      this.fazendas.set(res.content);
      this.totalPaginas.set(res.totalPages);
    });
  }

  onMudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  onEditar(fazenda: IFazenda) {
    // sua lógica depois
  }

  onExcluir(fazenda: IFazenda) {
    // sua lógica depois
  }

  onVerDetalhes(fazenda: IFazenda) {
    console.log(fazenda)
  }

  adicionarFazenda() {
    const dialogRef = this._hlmDialogService.open(DialogNovaFazenda, {
			context: {
				fazenda: {},
			},
			contentClass: 'sm:!max-w-[950px], sm:!min-w-[700px]',
		});

		dialogRef.closed$.subscribe((fazenda) => {
			if (fazenda) {
				this.carregar()
			}
		});
	}
  
}
