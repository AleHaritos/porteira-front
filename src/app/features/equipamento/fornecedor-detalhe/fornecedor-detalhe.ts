import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideHandshake, lucideTruck, lucideWrench, lucideReceipt, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { FornecedorService } from '../../../core/services/equipamento/fornecedor-service';
import { ManutencaoService } from '../../../core/services/veiculos/manutencao-service';
import { ManutencaoEquipamentoService } from '../../../core/services/equipamento/manutencao-equipamento-service';
import { ContaFornecedorService } from '../../../core/services/equipamento/conta-fornecedor-service';
import { ToastService } from '../../../core/services/toast-service';
import { IFornecedor } from '../../../shared/interfaces/IFornecedor';
import { PagarDebitoFornecedor } from '../pagar-debito-fornecedor/pagar-debito-fornecedor';
import { NovaContaFornecedor } from '../nova-conta-fornecedor/nova-conta-fornecedor';

type OrigemDebito = 'VEICULO' | 'EQUIPAMENTO' | 'CONTA';

interface DebitoPendente {
  id: number;
  origem: OrigemDebito;
  nomeAtivo: string;
  tipo: string;
  descricao?: string;
  data: string;
  valor: number;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const TAMANHO_PAGINA = 10;

@Component({
  selector: 'app-fornecedor-detalhe',
  imports: [CommonModule, HlmTableImports, HlmPaginationImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideArrowLeft, lucideHandshake, lucideTruck, lucideWrench, lucideReceipt, lucidePlus })],
  styleUrl: './fornecedor-detalhe.css',
  templateUrl: './fornecedor-detalhe.html',
})
export class FornecedorDetalhe implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fornecedorService = inject(FornecedorService);
  private manutencaoService = inject(ManutencaoService);
  private manutencaoEquipamentoService = inject(ManutencaoEquipamentoService);
  private contaFornecedorService = inject(ContaFornecedorService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId!: number;
  fornecedorId!: number;

  fornecedor = signal<IFornecedor | null>(null);
  todosDebitos = signal<DebitoPendente[]>([]);
  paginaAtual = signal(0);
  carregando = signal(false);

  readonly formatarValor = (valor: number) => moeda.format(valor);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.todosDebitos().length / TAMANHO_PAGINA)));

  debitosPaginados = computed(() => {
    const inicio = this.paginaAtual() * TAMANHO_PAGINA;
    return this.todosDebitos().slice(inicio, inicio + TAMANHO_PAGINA);
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

  ngOnInit(): void {
    this.fazendaId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.fornecedorId = Number(this.route.snapshot.paramMap.get('fornecedorId'));
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.paginaAtual.set(0);

    this.fornecedorService.buscarPorId(this.fornecedorId).subscribe({
      next: (fornecedor) => this.fornecedor.set(fornecedor),
    });

    this.manutencaoService.listarPendentesPorFornecedor(this.fornecedorId).subscribe({
      next: (veiculo) => {
        const debitosVeiculo: DebitoPendente[] = veiculo.map((m) => ({
          id: m.id,
          origem: 'VEICULO',
          nomeAtivo: m.veiculoNome,
          tipo: m.tipo,
          descricao: m.descricao,
          data: m.data,
          valor: m.valor,
        }));

        this.manutencaoEquipamentoService.listarPendentesPorFornecedor(this.fornecedorId).subscribe({
          next: (equipamento) => {
            const debitosEquipamento: DebitoPendente[] = equipamento.map((m) => ({
              id: m.id,
              origem: 'EQUIPAMENTO',
              nomeAtivo: m.equipamentoNome,
              tipo: m.tipo,
              descricao: m.descricao,
              data: m.data,
              valor: m.valor,
            }));

            this.contaFornecedorService.listarPendentesPorFornecedor(this.fornecedorId).subscribe({
              next: (contas) => {
                const debitosContas: DebitoPendente[] = contas.map((c) => ({
                  id: c.id,
                  origem: 'CONTA',
                  nomeAtivo: c.fornecedorNome,
                  tipo: 'OUTRO',
                  descricao: c.descricao,
                  data: c.data,
                  valor: c.valor,
                }));

                const todos = [...debitosVeiculo, ...debitosEquipamento, ...debitosContas]
                  .sort((a, b) => b.data.localeCompare(a.data));
                this.todosDebitos.set(todos);
                this.carregando.set(false);
              },
              error: () => this.carregando.set(false),
            });
          },
          error: () => this.carregando.set(false),
        });
      },
      error: () => this.carregando.set(false),
    });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
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

  abrirPagar(debito: DebitoPendente): void {
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

  voltar(): void {
    this.router.navigate(['/fazenda', this.fazendaId, 'fornecedores']);
  }
}