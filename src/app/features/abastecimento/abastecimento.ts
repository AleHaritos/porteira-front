import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ToastService } from '../../core/services/toast-service';
import { AbastecimentoService } from '../../core/services/veiculos/abastecimento-service';
import { VeiculoService } from '../../core/services/veiculos/veiculo-service';
import { IAbastecimento, LocalAbastecimento, TipoCombustivel } from '../../shared/interfaces/IAbastecimento';
import { IVeiculo } from '../../shared/interfaces/IVeiculos';
import { NovoAbastecimento } from './novo-abastecimento/novo-abastecimento';

@Component({
  selector: 'app-abastecimento',
  imports: [CommonModule, DatePipe, HlmTableImports, HlmPaginationImports, HlmButtonImports, HlmSelectImports, HlmLabelImports, NgIcon],
  providers: [provideIcons({ lucidePlus })],
  styleUrl: './abastecimento.css',
  templateUrl: './abastecimento.html',
})
export class Abastecimento implements OnInit {
  private route = inject(ActivatedRoute);
  private veiculoService = inject(VeiculoService);
  private abastecimentoService = inject(AbastecimentoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  veiculos = signal<IVeiculo[]>([]);
  veiculoSelecionadoId = signal<number | null>(null);

  abastecimentos = signal<IAbastecimento[]>([]);
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

  veiculoSelecionado = computed(() => this.veiculos().find((v) => v.id === this.veiculoSelecionadoId()) ?? null);

  itemToStringVeiculo = (value: number | null | undefined) => {
    const veiculo = this.veiculos().find((v) => v.id === value);
    return veiculo ? `${veiculo.nome} (${veiculo.placa})` : '';
  };

  localLabels: Record<LocalAbastecimento, string> = {
    ESTOQUE_FAZENDA: 'Estoque da Fazenda',
    POSTO_CREDENCIADO: 'Posto Credenciado',
    POSTO_CASUAL: 'Posto Casual',
  };

  tipoCombustivelLabels: Record<TipoCombustivel, string> = {
    DIESEL: 'Diesel',
    GASOLINA: 'Gasolina',
    ETANOL: 'Etanol',
  };

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregarVeiculos();
    });
  }

  carregarVeiculos() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.veiculoService.buscarPorFazenda(fazendaId, 0, 100).subscribe({
      next: (res) => {
        this.veiculos.set(res.content);
        if (res.content.length > 0 && this.veiculoSelecionadoId() == null) {
          this.veiculoSelecionadoId.set(res.content[0].id);
          this.carregar();
        }
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar os veículos'),
    });
  }

  onVeiculoChange(id: number | null | undefined) {
    this.veiculoSelecionadoId.set(id ?? null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  carregar() {
    const veiculoId = this.veiculoSelecionadoId();
    if (veiculoId == null) return;

    this.carregando.set(true);
    this.abastecimentoService.buscarPorVeiculo(veiculoId, this.paginaAtual(), 6).subscribe({
      next: (res) => {
        this.abastecimentos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os abastecimentos');
      },
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovoAbastecimento() {
    const fazendaId = this.fazendaId();
    const veiculo = this.veiculoSelecionado();
    if (fazendaId == null || veiculo == null) {
      this.toastService.showError('Erro', 'Selecione um veículo primeiro');
      return;
    }

    const dialogRef = this.dialogService.open(NovoAbastecimento, {
      context: { fazendaId, veiculoId: veiculo.id, veiculoNome: veiculo.nome },
      contentClass: 'sm:!max-w-[640px]',
    });

    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregar();
    });
  }

  localLabel(local: string): string {
    return this.localLabels[local as LocalAbastecimento] || local;
  }

  tipoCombustivelLabel(tipo: string): string {
    return this.tipoCombustivelLabels[tipo as TipoCombustivel] || tipo;
  }

  localDetalhe(abastecimento: IAbastecimento): string {
    if (abastecimento.localAbastecimento === 'POSTO_CREDENCIADO' && abastecimento.postoNome) {
      return `${this.localLabel(abastecimento.localAbastecimento)} - ${abastecimento.postoNome}`;
    }
    return this.localLabel(abastecimento.localAbastecimento);
  }

  formatarValor(valor: number | null): string {
    if (valor == null) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}