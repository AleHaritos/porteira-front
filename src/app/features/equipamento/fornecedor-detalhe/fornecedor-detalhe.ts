import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideHandshake, lucideTruck, lucideWrench, lucideReceipt, lucidePlus, lucideHandCoins, lucideCalendarClock } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { FornecedorService } from '../../../core/services/equipamento/fornecedor-service';
import { FornecedorDebitoService } from '../../../core/services/equipamento/fornecedor-debito-service';
import { ToastService } from '../../../core/services/toast-service';
import { IFornecedor } from '../../../shared/interfaces/IFornecedor';
import { IFornecedorDebito } from '../../../shared/interfaces/IFornecedorDebito';
import { PagarDebitoFornecedor } from '../pagar-debito-fornecedor/pagar-debito-fornecedor';
import { PagarDebitosSelecionados } from '../pagar-debitos-selecionados/pagar-debitos-selecionados';
import { NovaContaFornecedor } from '../nova-conta-fornecedor/nova-conta-fornecedor';

type StatusDebito = 'PENDENTE' | 'BAIXADO';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const TAMANHO_PAGINA = 10;

@Component({
  selector: 'app-fornecedor-detalhe',
  imports: [CommonModule, ReactiveFormsModule, HlmTableImports, HlmPaginationImports, HlmButtonImports, HlmDatePickerImports, NgIcon],
  providers: [provideIcons({ lucideArrowLeft, lucideHandshake, lucideTruck, lucideWrench, lucideReceipt, lucidePlus, lucideHandCoins, lucideCalendarClock })],
  styleUrl: './fornecedor-detalhe.css',
  templateUrl: './fornecedor-detalhe.html',
})
export class FornecedorDetalhe implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fornecedorService = inject(FornecedorService);
  private fornecedorDebitoService = inject(FornecedorDebitoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId!: number;
  fornecedorId!: number;

  fornecedor = signal<IFornecedor | null>(null);
  debitos = signal<IFornecedorDebito[]>([]);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  carregando = signal(false);
  filtroStatus = signal<StatusDebito>('PENDENTE');

  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(this.primeiroDiaDoMes());
  dataFimControl = new FormControl<Date | null>(new Date());

  selecionados = signal<Map<string, IFornecedorDebito>>(new Map());

  readonly formatarValor = (valor: number) => moeda.format(valor);

  totalSelecionado = computed(() => {
    let soma = 0;
    this.selecionados().forEach((d) => (soma += d.valor));
    return soma;
  });

  paginasVisiveis = computed(() => {
    const atual = this.paginaAtual();
    const total = this.totalPaginas();
    const inicio = Math.max(0, atual - 1);
    const fim = Math.min(total - 1, atual + 1);
    const paginas: number[] = [];
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
  });

  get todosDaPaginaSelecionados(): boolean {
    return this.debitos().length > 0 && this.debitos().every((d) => this.selecionados().has(this.chaveDebito(d)));
  }

  chaveDebito(debito: IFornecedorDebito): string {
    return `${debito.origem}-${debito.id}`;
  }

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  ngOnInit(): void {
    this.fazendaId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.fornecedorId = Number(this.route.snapshot.paramMap.get('fornecedorId'));

    this.fornecedorService.buscarPorId(this.fornecedorId).subscribe({
      next: (fornecedor) => this.fornecedor.set(fornecedor),
    });

    this.dataInicioControl.valueChanges.subscribe(() => this.onFiltroDataChange());
    this.dataFimControl.valueChanges.subscribe(() => this.onFiltroDataChange());

    this.carregar();
  }

  onFiltroStatusChange(status: StatusDebito): void {
    this.filtroStatus.set(status);
    this.paginaAtual.set(0);
    this.limparSelecao();
    this.carregar();
  }

  onFiltroDataChange(): void {
    this.paginaAtual.set(0);
    this.limparSelecao();
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);

    const dataInicio = this.dataInicioControl.value?.toISOString().split('T')[0] ?? '';
    const dataFim = this.dataFimControl.value?.toISOString().split('T')[0] ?? '';

    this.fornecedorDebitoService
      .listarPorFornecedorEStatus(this.fornecedorId, this.filtroStatus(), dataInicio, dataFim, this.paginaAtual(), TAMANHO_PAGINA)
      .subscribe({
        next: (res) => {
          this.debitos.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar os débitos');
        },
      });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  toggleSelecionado(debito: IFornecedorDebito): void {
    const novo = new Map(this.selecionados());
    const chave = this.chaveDebito(debito);
    if (novo.has(chave)) {
      novo.delete(chave);
    } else {
      novo.set(chave, debito);
    }
    this.selecionados.set(novo);
  }

  toggleSelecionarTodos(): void {
    const novo = new Map(this.selecionados());
    if (this.todosDaPaginaSelecionados) {
      this.debitos().forEach((d) => novo.delete(this.chaveDebito(d)));
    } else {
      this.debitos().forEach((d) => novo.set(this.chaveDebito(d), d));
    }
    this.selecionados.set(novo);
  }

  limparSelecao(): void {
    this.selecionados.set(new Map());
  }

  abrirLancarConta(): void {
    const dialogRef = this.dialogService.open(NovaContaFornecedor, {
      context: { fazendaId: this.fazendaId, fornecedorId: this.fornecedorId },
      contentClass: 'sm:!max-w-[750px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((sucesso) => {
      if (sucesso) {
        this.carregar();
      }
    });
  }

  abrirPagar(debito: IFornecedorDebito): void {
    const dialogRef = this.dialogService.open(PagarDebitoFornecedor, {
      context: {
        fazendaId: this.fazendaId,
        debitoId: debito.id,
        origem: debito.origem,
        nomeAtivo: debito.origem === 'CONTA' ? (debito.descricao || debito.nomeAtivo) : debito.nomeAtivo,
        valor: debito.valor,
      },
      contentClass: 'sm:!max-w-[750px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((sucesso) => {
      if (sucesso) {
        this.toastService.showSuccess('Sucesso', 'Pagamento registrado com sucesso');
        this.carregar();
      }
    });
  }

  abrirPagarSelecionados(): void {
    const selecionados = Array.from(this.selecionados().values());
    if (selecionados.length === 0) return;

    const dialogRef = this.dialogService.open(PagarDebitosSelecionados, {
      context: { fazendaId: this.fazendaId, debitos: selecionados },
      contentClass: 'sm:!max-w-[640px], sm:!min-w-[520px]',
    });

    dialogRef.closed$.subscribe((sucesso) => {
      if (sucesso) {
        this.limparSelecao();
        this.carregar();
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/fazenda', this.fazendaId, 'fornecedores']);
  }
}