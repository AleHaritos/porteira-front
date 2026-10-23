import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { IngredienteService } from '../../../core/services/animais/ingrediente-service';
import { RacaoService } from '../../../core/services/animais/racao-service';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { IIngrediente } from '../../../shared/interfaces/IIngrediente';
import { IRacao } from '../../../shared/interfaces/IRacao';
import { NovaRacao } from '../nova-racao/nova-racao';
import { NovoIngrediente } from '../novo-ingrediente/novo-ingrediente';

@Component({
  selector: 'app-racao-tab',
  imports: [CommonModule, HlmTableImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucidePencil, lucideTrash2 })],
  templateUrl: './racao-tab.html',
  styleUrl: './racao-tab.css',
})
export class RacaoTab implements OnInit {
  fazendaId = input.required<number>();

  private ingredienteService = inject(IngredienteService);
  private racaoService = inject(RacaoService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  ingredientes = signal<IIngrediente[]>([]);
  racoes = signal<IRacao[]>([]);
  carregandoIngredientes = signal(false);
  carregandoRacoes = signal(false);

  ngOnInit(): void {
    this.carregarIngredientes();
    this.carregarRacoes();
  }

  carregarIngredientes(): void {
    this.carregandoIngredientes.set(true);
    this.ingredienteService.listarPorFazenda(this.fazendaId()).subscribe({
      next: (res) => {
        this.ingredientes.set(res);
        this.carregandoIngredientes.set(false);
      },
      error: () => {
        this.carregandoIngredientes.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os ingredientes');
      },
    });
  }

  carregarRacoes(): void {
    this.carregandoRacoes.set(true);
    this.racaoService.listarPorFazenda(this.fazendaId()).subscribe({
      next: (res) => {
        this.racoes.set(res);
        this.carregandoRacoes.set(false);
      },
      error: () => {
        this.carregandoRacoes.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar as rações');
      },
    });
  }

  abrirNovoIngrediente(ingrediente?: IIngrediente): void {
    const dialogRef = this.dialogService.open(NovoIngrediente, {
      context: { fazendaId: this.fazendaId(), ingrediente: ingrediente ?? null },
      contentClass: 'sm:!max-w-[480px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregarIngredientes();
    });
  }

  abrirNovaRacao(racao?: IRacao): void {
    const dialogRef = this.dialogService.open(NovaRacao, {
      context: { fazendaId: this.fazendaId(), ingredientes: this.ingredientes(), racao: racao ?? null },
      contentClass: 'sm:!max-w-[640px], sm:!min-w-[520px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregarRacoes();
    });
  }

  inativarIngrediente(ingrediente: IIngrediente): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Remover ingrediente',
        mensagem: `Tem certeza que deseja remover "${ingrediente.nome}"? Rações que já usam esse ingrediente continuam com os valores atuais.`,
        textoConfirmar: 'Remover',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.ingredienteService.inativar(ingrediente.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Ingrediente removido com sucesso!');
            this.carregarIngredientes();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível remover o ingrediente'),
        });
      }
    });
  }

  inativarRacao(racao: IRacao): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Remover ração',
        mensagem: `Tem certeza que deseja remover a ração "${racao.nome}"?`,
        textoConfirmar: 'Remover',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.racaoService.inativar(racao.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Ração removida com sucesso!');
            this.carregarRacoes();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível remover a ração'),
        });
      }
    });
  }
}