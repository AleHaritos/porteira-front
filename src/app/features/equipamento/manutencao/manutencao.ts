import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTruck, lucideWrench } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { EquipamentoService } from '../../../core/services/equipamento/equipamento-service';
import { ManutencaoEquipamentoService } from '../../../core/services/equipamento/manutencao-equipamento-service';
import { ToastService } from '../../../core/services/toast-service';
import { ManutencaoService } from '../../../core/services/veiculos/manutencao-service';
import { VeiculoService } from '../../../core/services/veiculos/veiculo-service';
import { IEquipamento } from '../../../shared/interfaces/IEquipamento';
import { IManutencao } from '../../../shared/interfaces/IManutencao';
import { IManutencaoEquipamento } from '../../../shared/interfaces/IManutencaoEquipamento';
import { IVeiculo } from '../../../shared/interfaces/IVeiculos';
import { NovaManutencao } from '../nova-manutencao/nova-manutencao';

type TipoAtivo = 'VEICULO' | 'EQUIPAMENTO';

@Component({
  selector: 'app-manutencao',
  imports: [
    CommonModule,
    DatePipe,
    HlmTableImports,
    HlmPaginationImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmLabelImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideTruck, lucideWrench })],
  styleUrl: './manutencao.css',
  templateUrl: './manutencao.html',
})
export class Manutencao implements OnInit {
  private route = inject(ActivatedRoute);
  private manutencaoService = inject(ManutencaoService);
  private manutencaoEquipamentoService = inject(ManutencaoEquipamentoService);
  private veiculoService = inject(VeiculoService);
  private equipamentoService = inject(EquipamentoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  tipoAtivo = signal<TipoAtivo>('VEICULO');

  veiculos = signal<IVeiculo[]>([]);
  equipamentos = signal<IEquipamento[]>([]);
  ativoSelecionadoId = signal<number | null>(null);

  registrosVeiculo = signal<IManutencao[]>([]);
  registrosEquipamento = signal<IManutencaoEquipamento[]>([]);

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

  itemToStringAtivo = (value: number | null | undefined) => {
    const lista = this.tipoAtivo() === 'VEICULO' ? this.veiculos() : this.equipamentos();
    return lista.find((item) => item.id === value)?.nome ?? '';
  };

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregarAtivos();
    });
  }

  carregarAtivos(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.veiculoService.buscarPorFazenda(fazendaId, 0, 100).subscribe({
      next: (res) => {
        this.veiculos.set(res.content);
        if (this.tipoAtivo() === 'VEICULO' && res.content.length > 0 && this.ativoSelecionadoId() == null) {
          this.ativoSelecionadoId.set(res.content[0].id);
          this.carregar();
        }
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar os veículos'),
    });

    this.equipamentoService.buscarPorFazenda(fazendaId, 0, 100).subscribe({
      next: (res) => this.equipamentos.set(res.content),
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar os equipamentos'),
    });
  }

  onTipoAtivoChange(tipo: TipoAtivo): void {
    this.tipoAtivo.set(tipo);
    this.paginaAtual.set(0);
    const lista = tipo === 'VEICULO' ? this.veiculos() : this.equipamentos();
    this.ativoSelecionadoId.set(lista.length > 0 ? lista[0].id : null);
    this.carregar();
  }

  onAtivoChange(id: number | null | undefined): void {
    this.ativoSelecionadoId.set(id ?? null);
    this.paginaAtual.set(0);
    this.carregar();
  }

  carregar(): void {
    const ativoId = this.ativoSelecionadoId();
    if (ativoId == null) return;

    this.carregando.set(true);
    if (this.tipoAtivo() === 'VEICULO') {
      this.manutencaoService.buscarPorVeiculo(ativoId, this.paginaAtual(), 6).subscribe({
        next: (res) => {
          this.registrosVeiculo.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar as manutenções');
        },
      });
    } else {
      this.manutencaoEquipamentoService.buscarPorEquipamento(ativoId, this.paginaAtual(), 6).subscribe({
        next: (res) => {
          this.registrosEquipamento.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar as manutenções');
        },
      });
    }
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovaManutencao(): void {
    const dialogRef = this.dialogService.open(NovaManutencao, {
      context: {
        fazendaId: this.fazendaId(),
        tipoAtivoInicial: this.tipoAtivo(),
        ativoIdInicial: this.ativoSelecionadoId(),
        veiculos: this.veiculos(),
        equipamentos: this.equipamentos(),
      },
      contentClass: 'sm:!max-w-[850px], sm:!min-w-[650px]',
    });
    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregar();
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarPagamento(forma: string): string {
    return forma === 'A_VISTA' ? 'À vista' : 'Fornecedor (fiado)';
  }
}
