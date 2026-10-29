import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideListTodo, lucidePlus, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports, HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { TarefaService } from '../../../core/services/tarefa/tarefa-service';
import { ToastService } from '../../../core/services/toast-service';
import { ISubTarefa, ITarefa, PrioridadeTarefa } from '../../../shared/interfaces/ITarefa';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

interface NovaTarefaContext {
  fazendaId: number;
  tarefa?: ITarefa;
}

const PRIORIDADE_OPTIONS: { value: PrioridadeTarefa; label: string }[] = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
];

@Component({
  selector: 'app-nova-tarefa',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmDatePickerImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideListTodo, lucidePlus, lucideTrash2, lucideX })],
  styleUrl: './nova-tarefa.css',
  templateUrl: './nova-tarefa.html',
})
export class NovaTarefa implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovaTarefaContext>();
  private fb = inject(FormBuilder);
  private tarefaService = inject(TarefaService);
  private toastService = inject(ToastService);
  private dialogService = inject(HlmDialogService);

  salvando = signal(false);
  editando = signal(!!this.context.tarefa);
  prioridadeOptions = PRIORIDADE_OPTIONS;
  prioridadeSelecionada = signal<PrioridadeTarefa>('MEDIA');

  subtarefas = signal<ISubTarefa[]>(this.context.tarefa?.subtarefas ?? []);
  novasSubtarefasPendentes = signal<string[]>([]);
  novaSubtarefaTitulo = signal('');
  salvandoSubtarefa = signal(false);

  itemToStringPrioridade = (value: PrioridadeTarefa | null | undefined) =>
    this.prioridadeOptions.find((o) => o.value === value)?.label ?? '';

  form = this.fb.group({
    titulo: ['', Validators.required],
    descricao: [''],
    prazo: [null as Date | null],
  });

  ngOnInit(): void {
    const tarefa = this.context.tarefa;
    if (tarefa) {
      this.form.patchValue({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || '',
        prazo: tarefa.prazo ? this.parseData(tarefa.prazo) : null,
      });
      this.prioridadeSelecionada.set(tarefa.prioridade);
    }
  }

  onPrioridadeChange(valor: PrioridadeTarefa | null | undefined): void {
    if (valor) this.prioridadeSelecionada.set(valor);
  }

  private parseData(iso: string): Date {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  adicionarSubtarefa(): void {
    const titulo = this.novaSubtarefaTitulo().trim();
    if (!titulo) return;

    if (this.editando()) {
      const tarefa = this.context.tarefa!;
      this.salvandoSubtarefa.set(true);
      this.tarefaService.adicionarSubtarefa(tarefa.id, { titulo }).subscribe({
        next: (sub) => {
          this.subtarefas.update((lista) => [...lista, sub]);
          this.novaSubtarefaTitulo.set('');
          this.salvandoSubtarefa.set(false);
        },
        error: () => {
          this.salvandoSubtarefa.set(false);
          this.toastService.showError('Erro', 'Não foi possível adicionar a subtarefa');
        },
      });
    } else {
      this.novasSubtarefasPendentes.update((lista) => [...lista, titulo]);
      this.novaSubtarefaTitulo.set('');
    }
  }

  removerSubtarefaPendente(index: number): void {
    this.novasSubtarefasPendentes.update((lista) => lista.filter((_, i) => i !== index));
  }

  toggleSubtarefa(sub: ISubTarefa): void {
    this.tarefaService.alternarSubtarefa(sub.id).subscribe({
      next: () => {
        this.subtarefas.update((lista) =>
          lista.map((s) => (s.id === sub.id ? { ...s, concluida: !s.concluida } : s))
        );
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível atualizar a subtarefa'),
    });
  }

  excluirSubtarefa(sub: ISubTarefa): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir Subtarefa',
        mensagem: `Deseja realmente excluir "${sub.titulo}"?`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.tarefaService.excluirSubtarefa(sub.id).subscribe({
          next: () => {
            this.subtarefas.update((lista) => lista.filter((s) => s.id !== sub.id));
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível excluir a subtarefa'),
        });
      }
    });
  }

    salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Erro', 'Informe o título da tarefa');
      return;
    }

    const { titulo, descricao, prazo } = this.form.value;
    const tarefa = this.context.tarefa;

    const request = {
      fazendaId: this.context.fazendaId,
      titulo: titulo!,
      descricao: descricao || undefined,
      prioridade: this.prioridadeSelecionada(),
      prazo: prazo ? this.formatarDataIso(prazo as Date) : null,
      ...(!tarefa ? { subtarefas: this.novasSubtarefasPendentes() } : {}),
    };

    this.salvando.set(true);

    const chamada = tarefa
      ? this.tarefaService.atualizar(tarefa.id, request)
      : this.tarefaService.salvar(request);

    chamada.subscribe({
      next: () => {
        this.toastService.showSuccess('Sucesso', tarefa ? 'Tarefa atualizada!' : 'Tarefa criada!');
        this.salvando.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', 'Não foi possível salvar a tarefa');
      },
    });
  }
}