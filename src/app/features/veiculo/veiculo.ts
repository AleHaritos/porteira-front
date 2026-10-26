import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ToastService } from '../../core/services/toast-service';
import { VeiculoService } from '../../core/services/veiculos/veiculo-service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { IVeiculo, TipoVeiculo } from '../../shared/interfaces/IVeiculos';
import { NovaVeiculo } from './nova-veiculo/nova-veiculo';
import { ResumoVeiculo } from './resumo-veiculo/resumo-veiculo';

@Component({
  selector: 'app-veiculo',
  imports: [CommonModule, HlmTableImports, HlmPaginationImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucidePencil, lucideTrash2 })],
  styleUrl: './veiculo.css',
  templateUrl: './veiculo.html',
})
export class Veiculo implements OnInit {
  private route = inject(ActivatedRoute);
  private veiculoService = inject(VeiculoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);

  veiculos = signal<IVeiculo[]>([]);
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

  tipoOptions: { value: TipoVeiculo; label: string }[] = [
    { value: 'CAMINHAO', label: 'Caminhão' },
    { value: 'TRATOR', label: 'Trator' },
    { value: 'CARRO', label: 'Carro' },
    { value: 'MOTO', label: 'Moto' },
  ];

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.paginaAtual.set(0);
      this.carregar();
    });
  }

  carregar() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.veiculoService.buscarPorFazenda(fazendaId, this.paginaAtual(), 6).subscribe({
      next: (res) => {
        this.veiculos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os veículos');
      },
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  abrirNovoVeiculo() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaVeiculo, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregar();
    });
  }

  abrirResumo(veiculo: IVeiculo): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.dialogService.open(ResumoVeiculo, {
      context: { veiculo, fazendaId },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[700px]',
    });
  }

  editar(veiculo: IVeiculo) {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaVeiculo, {
      context: { fazendaId, veiculo },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[680px]',
    });

    dialogRef.closed$.subscribe((atualizado) => {
      if (atualizado) this.carregar();
    });
  }

  inativar(veiculo: IVeiculo) {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Inativar veículo',
        mensagem: `Tem certeza que deseja inativar o veículo "${veiculo.nome}" (${veiculo.placa})? Ele deixará de aparecer nas listas de abastecimento e manutenção.`,
        textoConfirmar: 'Inativar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.veiculoService.inativar(veiculo.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Veículo inativado com sucesso!');
            this.carregar();
          },
          error: () => {
            this.toastService.showError('Erro', 'Não foi possível inativar o veículo');
          },
        });
      }
    });
  }

  tipoLabel(tipo: string): string {
    return this.tipoOptions.find((o) => o.value === tipo)?.label || tipo;
  }
}