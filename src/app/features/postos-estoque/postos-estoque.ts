import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideHandCoins, lucideFuel } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ToastService } from '../../core/services/toast-service';
import { EstoqueCombustivelService } from '../../core/services/veiculos/estoque-combustivel-service';
import { PostoService } from '../../core/services/veiculos/posto-service';
import { TipoCombustivel } from '../../shared/interfaces/IAbastecimento';
import { IEstoqueCombustivel } from '../../shared/interfaces/IEstoqueCombustivel';
import { IPosto } from '../../shared/interfaces/IPosto';
import { PagarPosto } from './pagar-posto/pagar-posto';
import { ReabastecerEstoque } from './reabastecer-estoque/reabastecer-estoque';
import { NovoPosto } from './novo-posto/novo-posto';

@Component({
  selector: 'app-postos-estoque',
  imports: [CommonModule, HlmTableImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideHandCoins, lucideFuel })],
  styleUrl: './postos-estoque.css',
  templateUrl: './postos-estoque.html',
})
export class PostosEstoque implements OnInit {
  private route = inject(ActivatedRoute);
  private postoService = inject(PostoService);
  private estoqueCombustivelService = inject(EstoqueCombustivelService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  postos = signal<IPosto[]>([]);
  carregandoPostos = signal(false);

  estoques = signal<IEstoqueCombustivel[]>([]);
  carregandoEstoques = signal(false);

  tipoCombustivelLabels: Record<TipoCombustivel, string> = {
    DIESEL: 'Diesel',
    GASOLINA: 'Gasolina',
    ETANOL: 'Etanol',
  };

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
    this.postoService.listarPorFazenda(fazendaId).subscribe({
      next: (postos) => {
        this.postos.set(postos);
        this.carregandoPostos.set(false);
      },
      error: () => {
        this.carregandoPostos.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os postos');
      },
    });
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

  abrirPagarPosto(posto: IPosto) {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(PagarPosto, {
      context: { fazendaId, posto },
      contentClass: 'sm:!max-w-[520px]',
    });

    dialogRef.closed$.subscribe((pago) => {
      if (pago) this.carregarPostos();
    });
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
