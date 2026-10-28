import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePawPrint, lucidePlus, lucideSquarePen, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { LoteService } from '../../core/services/animais/lote-service';
import { ToastService } from '../../core/services/toast-service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { ILote } from '../../shared/interfaces/ILote';
import { NovoLote } from './novo-lote/novo-lote';
import { TruncarPipe } from '../../shared/pipes/TruncarPipe';
import { PiquetesTab } from './piquetes-tab/piquetes-tab';
import { RacaoTab } from './racao-tab/racao-tab';
import { OperacoesVendaTab } from './operacoes-venda-tab/operacoes-venda-tab';
import { ResumoAnimaisTab } from './resumo-animais-tab/resumo-animais-tab';
import { TodosAnimaisTab } from './todos-animais-tab/todos-animais-tab';

type AbaAnimais = 'piquetes' | 'todos' | 'lotes' | 'racao' | 'vendas' | 'resumo';

@Component({
  selector: 'app-animais',
  imports: [
    CommonModule,
    HlmTableImports,
    HlmButtonImports,
    HlmTabsImports,
    TruncarPipe,
    NgIcon,
    PiquetesTab,
    TodosAnimaisTab,
    RacaoTab,
    OperacoesVendaTab,
    ResumoAnimaisTab
  ],
  providers: [provideIcons({ lucidePawPrint, lucidePlus, lucideSquarePen, lucideTrash2 })],
  styleUrl: './animais.css',
  templateUrl: './animais.html',
})
export class Animais implements OnInit {
  private route = inject(ActivatedRoute);
  private loteService = inject(LoteService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  lotes = signal<ILote[]>([]);
  carregando = signal(false);

  abaAtiva = signal<AbaAnimais>('piquetes');

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregar();
    });
  }

  selecionarAba(aba: AbaAnimais): void {
    this.abaAtiva.set(aba);
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.loteService.listarPorFazenda(fazendaId).subscribe({
      next: (res) => {
        this.lotes.set(res);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os lotes');
      },
    });
  }

  abrirNovoLote(lote?: ILote): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoLote, {
      context: { fazendaId, lote: lote ?? null },
      contentClass: 'sm:!max-w-[720px], sm:!min-w-[620px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  inativar(lote: ILote): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Inativar Lote',
        mensagem: `Deseja realmente inativar o lote "${lote.nome}"?`,
        textoConfirmar: 'Inativar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.loteService.inativar(lote.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Lote inativado com sucesso!');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível inativar o lote'),
        });
      }
    });
  }
}