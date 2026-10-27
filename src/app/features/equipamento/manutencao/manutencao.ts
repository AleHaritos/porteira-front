import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarClock, lucidePlus, lucideTrash2, lucideTruck, lucideWrench } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
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
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { NovaManutencaoParcelada } from '../nova-manutencao-parcelada/nova-manutencao-parcelada';

type TipoAtivo = 'VEICULO' | 'EQUIPAMENTO';

@Component({
  selector: 'app-manutencao',
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    HlmTableImports,
    HlmPaginationImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmDatePickerImports,
    HlmLabelImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideTruck, lucideWrench, lucideTrash2, lucideCalendarClock })],
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
  ativoSelecionadoId = signal<number>(0);

  registrosVeiculo = signal<IManutencao[]>([]);
  registrosEquipamento = signal<IManutencaoEquipamento[]>([]);

  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(this.primeiroDiaDoMes());
  dataFimControl = new FormControl<Date | null>(new Date());

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
    if (!value) return 'Todos';
    const lista = this.tipoAtivo() === 'VEICULO' ? this.veiculos() : this.equipamentos();
    return lista.find((item) => item.id === value)?.nome ?? '';
  };

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregarAtivos();
    });

    this.dataInicioControl.valueChanges.subscribe(() => this.onFiltroDataChange());
    this.dataFimControl.valueChanges.subscribe(() => this.onFiltroDataChange());
  }

  onFiltroDataChange(): void {
    this.paginaAtual.set(0);
    this.carregar();
  }

  carregarAtivos(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.veiculoService.buscarPorFazenda(fazendaId, 0, 100).subscribe({
      next: (res) => {
        this.veiculos.set(res.content);
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar os veículos'),
    });

    this.equipamentoService.buscarPorFazenda(fazendaId, 0, 100).subscribe({
      next: (res) => this.equipamentos.set(res.content),
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar os equipamentos'),
    });

    this.carregar();
  }

  onTipoAtivoChange(tipo: TipoAtivo): void {
    this.tipoAtivo.set(tipo);
    this.paginaAtual.set(0);
    this.ativoSelecionadoId.set(0);
    this.carregar();
  }

  onAtivoChange(id: number | null | undefined): void {
    this.ativoSelecionadoId.set(id ?? 0);
    this.paginaAtual.set(0);
    this.carregar();
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    const dataInicio = this.dataInicioControl.value;
    const dataFim = this.dataFimControl.value;
    if (fazendaId == null || !dataInicio || !dataFim) return;

    const dataInicioStr = dataInicio.toISOString().split('T')[0];
    const dataFimStr = dataFim.toISOString().split('T')[0];
    const ativoId = this.ativoSelecionadoId() || null;

    this.carregando.set(true);
    if (this.tipoAtivo() === 'VEICULO') {
      this.manutencaoService.buscarPorFazenda(fazendaId, ativoId, dataInicioStr, dataFimStr, this.paginaAtual(), 6).subscribe({
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
      this.manutencaoEquipamentoService.buscarPorFazenda(fazendaId, ativoId, dataInicioStr, dataFimStr, this.paginaAtual(), 6).subscribe({
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

  abrirManutencaoParcelada(): void {
    const dialogRef = this.dialogService.open(NovaManutencaoParcelada, {
      context: {
        fazendaId: this.fazendaId(),
        tipoAtivoInicial: this.tipoAtivo(),
        ativoIdInicial: this.ativoSelecionadoId() || null,
        veiculos: this.veiculos(),
        equipamentos: this.equipamentos(),
      },
      contentClass: 'sm:!max-w-[850px], sm:!min-w-[650px]',
    });
    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregar();
    });
  }

  excluir(registro: IManutencao | IManutencaoEquipamento): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir manutenção',
        mensagem: `Tem certeza que deseja excluir esta manutenção${registro.descricao ? ' (' + registro.descricao + ')' : ''}? Essa ação não pode ser desfeita e vai estornar a transação ou o saldo devedor gerado.`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[500px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        const servico = this.tipoAtivo() === 'VEICULO' ? this.manutencaoService : this.manutencaoEquipamentoService;
        servico.excluir(registro.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Manutenção excluída com sucesso');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível excluir a manutenção'),
        });
      }
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarPagamento(forma: string): string {
    return forma === 'A_VISTA' ? 'À vista' : 'Fornecedor (fiado)';
  }
}