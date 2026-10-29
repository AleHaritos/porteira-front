import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePlus, lucidePencil } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ColheitaTalhaoService } from '../../../core/services/safra/colheita-talhao-service';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { IColheitaTalhao } from '../../../shared/interfaces/IColheitaTalhao';
import { ITalhao } from '../../../shared/interfaces/ITalhao';
import { NovoColheita } from '../novo-colheita/novo-colheita';

const numeroFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-colheita-talhao-tab',
  imports: [HlmButtonImports, HlmTableImports, HlmPaginationImports, NgIcon, DatePipe],
  providers: [provideIcons({ lucideTrash2, lucidePlus, lucidePencil })],
  styleUrl: './colheita-talhao-tab.css',
  templateUrl: './colheita-talhao-tab.html',
})
export class ColheitaTalhaoTab implements OnInit {
  talhaoId = input.required<number>();
  talhao = input<ITalhao | null>(null);
  colheitaAlterada = output<void>();

  private colheitaTalhaoService = inject(ColheitaTalhaoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  private readonly tamanhoPagina = 10;

  colheitas = signal<IColheitaTalhao[]>([]);
  carregando = signal(false);
  paginaAtual = signal(0);

  areaHectares = computed(() => this.talhao()?.areaHectares ?? 0);

  producaoTotal = computed(() => this.colheitas().reduce((soma, c) => soma + c.quantidadeColhida, 0));
  receitaTotal = computed(() => this.colheitas().reduce((soma, c) => soma + c.quantidadeColhida * c.valorUnitario, 0));
  producaoPorHa = computed(() => (this.areaHectares() ? this.producaoTotal() / this.areaHectares() : 0));
  receitaPorHa = computed(() => (this.areaHectares() ? this.receitaTotal() / this.areaHectares() : 0));

  totalPaginas = computed(() => Math.ceil(this.colheitas().length / this.tamanhoPagina));

  colheitasPaginadas = computed(() => {
    const inicio = this.paginaAtual() * this.tamanhoPagina;
    return this.colheitas().slice(inicio, inicio + this.tamanhoPagina);
  });

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

  readonly formatarSacas = (valor: number) => `${numeroFormatter.format(valor)} sc`;
  readonly formatarValor = (valor: number) => moeda.format(valor);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.colheitaTalhaoService.listarPorTalhao(this.talhaoId()).subscribe({
      next: (colheitas) => {
        this.colheitas.set(colheitas);
        this.carregando.set(false);

        const totalPaginas = Math.max(1, Math.ceil(colheitas.length / this.tamanhoPagina));
        if (this.paginaAtual() > totalPaginas - 1) {
          this.paginaAtual.set(totalPaginas - 1);
        }
      },
      error: () => this.carregando.set(false),
    });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
  }

  abrirNovaColheita(): void {
    const dialogRef = this.dialogService.open(NovoColheita, {
      context: { talhaoId: this.talhaoId() },
      contentClass: 'sm:!max-w-[520px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) {
        this.carregar();
        this.colheitaAlterada.emit();
      }
    });
  }

  editar(colheita: IColheitaTalhao): void {
    const dialogRef = this.dialogService.open(NovoColheita, {
      context: { talhaoId: this.talhaoId(), colheita },
      contentClass: 'sm:!max-w-[520px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) {
        this.carregar();
        this.colheitaAlterada.emit();
      }
    });
  }

  excluir(colheita: IColheitaTalhao): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir colheita',
        mensagem: `Tem certeza que deseja excluir "${colheita.descricao || 'esta colheita'}"? Essa ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.colheitaTalhaoService.excluir(colheita.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Colheita removida');
            this.carregar();
            this.colheitaAlterada.emit();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível remover a colheita'),
        });
      }
    });
  }
}