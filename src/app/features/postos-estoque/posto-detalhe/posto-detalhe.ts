import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ToastService } from '../../../core/services/toast-service';
import { AbastecimentoService } from '../../../core/services/veiculos/abastecimento-service';
import { PostoService } from '../../../core/services/veiculos/posto-service';
import { IAbastecimento, TipoCombustivel } from '../../../shared/interfaces/IAbastecimento';
import { IPosto } from '../../../shared/interfaces/IPosto';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-posto-detalhe',
  imports: [CommonModule, DatePipe, HlmTableImports, HlmPaginationImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideArrowLeft })],
  styleUrl: './posto-detalhe.css',
  templateUrl: './posto-detalhe.html',
})
export class PostoDetalhe implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postoService = inject(PostoService);
  private abastecimentoService = inject(AbastecimentoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  postoId = signal<number | null>(null);
  posto = signal<IPosto | null>(null);

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

  tipoCombustivelLabels: Record<TipoCombustivel, string> = {
    DIESEL: 'Diesel',
    GASOLINA: 'Gasolina',
    ETANOL: 'Etanol',
  };

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
    });

    this.route.paramMap.subscribe((params) => {
      const postoId = params.get('postoId');
      this.postoId.set(postoId ? Number(postoId) : null);
      this.carregarPosto();
      this.carregar();
    });
  }

  carregarPosto() {
    const fazendaId = this.fazendaId();
    const postoId = this.postoId();
    if (fazendaId == null || postoId == null) return;

    this.postoService.listarPorFazenda(fazendaId).subscribe({
      next: (postos) => this.posto.set(postos.find((p) => p.id === postoId) ?? null),
    });
  }

  carregar() {
    const postoId = this.postoId();
    if (postoId == null) return;

    this.carregando.set(true);
    this.abastecimentoService.buscarPorPosto(postoId, this.paginaAtual(), 10).subscribe({
      next: (res) => {
        this.abastecimentos.set(res.content);
        this.totalPaginas.set(res.totalPages);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os abastecimentos do posto');
      },
    });
  }

  irPara(pagina: number) {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  voltar() {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;
    this.router.navigate(['/fazenda', fazendaId, 'posto']);
  }

  pagar(abastecimento: IAbastecimento) {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Confirmar pagamento',
        mensagem: `Confirmar o pagamento do abastecimento de ${abastecimento.veiculoNome} em ${this.formatarDataExibicao(abastecimento.data)} no valor de ${this.formatarValor(abastecimento.valorTotal)}?`,
        textoConfirmar: 'Confirmar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.abastecimentoService.darBaixa(abastecimento.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
            this.carregar();
            this.carregarPosto();
          },
          error: () => {
            this.toastService.showError('Erro', 'Não foi possível registrar o pagamento');
          },
        });
      }
    });
  }

  tipoCombustivelLabel(tipo: string): string {
    return this.tipoCombustivelLabels[tipo as TipoCombustivel] || tipo;
  }

  statusClasse(status: string | null | undefined): string {
    return status === 'BAIXADO' ? 'posto-detalhe__status--baixado' : 'posto-detalhe__status--pendente';
  }

  statusLabel(status: string | null | undefined): string {
    return status === 'BAIXADO' ? 'Pago' : 'Pendente';
  }

  formatarValor(valor: number | null): string {
    if (valor == null) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private formatarDataExibicao(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}