import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideListTodo, lucidePlus, lucideCalendarClock, lucideTrash2, lucidePencil, lucideFlag } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { TarefaService } from '../../core/services/tarefa/tarefa-service';
import { ToastService } from '../../core/services/toast-service';
import { ITarefa, PrioridadeTarefa, StatusTarefa } from '../../shared/interfaces/ITarefa';
import { NovaTarefa } from './nova-tarefa/nova-tarefa';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

interface ColunaKanban {
  status: StatusTarefa;
  titulo: string;
  tarefas: ITarefa[];
}

const COLUNAS_BASE: { status: StatusTarefa; titulo: string }[] = [
  { status: 'A_FAZER', titulo: 'A Fazer' },
  { status: 'EM_ANDAMENTO', titulo: 'Em Andamento' },
  { status: 'CONCLUIDO', titulo: 'Concluído' },
];

const PRIORIDADE_LABEL: Record<PrioridadeTarefa, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
};

@Component({
  selector: 'app-tarefa',
  imports: [CommonModule, DatePipe, CdkDropListGroup, CdkDropList, CdkDrag, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideListTodo, lucidePlus, lucideCalendarClock, lucideTrash2, lucidePencil, lucideFlag })],
  styleUrl: './tarefa.css',
  templateUrl: './tarefa.html',
})
export class Tarefa implements OnInit {
  private route = inject(ActivatedRoute);
  private tarefaService = inject(TarefaService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  readonly prioridadeLabel = PRIORIDADE_LABEL;

  fazendaId = signal<number | null>(null);
  carregando = signal(false);
  colunas = signal<ColunaKanban[]>(COLUNAS_BASE.map((c) => ({ ...c, tarefas: [] })));

  idsColunas = computed(() => this.colunas().map((c) => c.status));

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregar();
    });
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.tarefaService.buscarPorFazenda(fazendaId).subscribe({
      next: (tarefas) => {
        this.colunas.set(
          COLUNAS_BASE.map((c) => ({
            ...c,
            tarefas: tarefas.filter((t) => t.status === c.status).sort((a, b) => a.ordem - b.ordem),
          }))
        );
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar as tarefas');
      },
    });
  }

  onDrop(event: CdkDragDrop<ITarefa[]>, statusDestino: StatusTarefa): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.persistirOrdem(event.container.data, statusDestino);
    } else {
      const tarefaMovida = event.previousContainer.data[event.previousIndex];
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      tarefaMovida.status = statusDestino;

      const colunaOrigem = this.colunas().find((c) => c.tarefas === event.previousContainer.data);
      if (colunaOrigem) this.persistirOrdem(event.previousContainer.data, colunaOrigem.status);
      this.persistirOrdem(event.container.data, statusDestino);
    }
    this.colunas.set([...this.colunas()]);
  }

  private persistirOrdem(lista: ITarefa[], status: StatusTarefa): void {
    lista.forEach((tarefa, index) => {
      this.tarefaService.atualizarStatus(tarefa.id, { status, ordem: index }).subscribe({
        error: () => this.toastService.showError('Erro', 'Não foi possível atualizar a tarefa'),
      });
    });
  }

  abrirNovaTarefa(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaTarefa, {
      context: { fazendaId },
      contentClass: 'sm:!max-w-[700px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((criada) => {
      if (criada) this.carregar();
    });
  }

  editarTarefa(tarefa: ITarefa): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaTarefa, {
      context: { fazendaId, tarefa },
      contentClass: 'sm:!max-w-[700px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((salva) => {
      if (salva) this.carregar();
    });
  }

  excluirTarefa(tarefa: ITarefa): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir Tarefa',
        mensagem: `Deseja realmente excluir a tarefa "${tarefa.titulo}"?`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[500px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.tarefaService.excluir(tarefa.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Tarefa excluída');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível excluir a tarefa'),
        });
      }
    });
  }

  toggleSubtarefa(subtarefaId: number): void {
    this.tarefaService.alternarSubtarefa(subtarefaId).subscribe({
      next: () => this.carregar(),
      error: () => this.toastService.showError('Erro', 'Não foi possível atualizar a subtarefa'),
    });
  }

  subtarefasConcluidas(tarefa: ITarefa): number {
    return tarefa.subtarefas.filter((s) => s.concluida).length;
  }

  estaAtrasada(tarefa: ITarefa): boolean {
    if (!tarefa.prazo || tarefa.status === 'CONCLUIDO') return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const [ano, mes, dia] = tarefa.prazo.split('-').map(Number);
    const prazo = new Date(ano, mes - 1, dia);
    return prazo < hoje;
  }
}