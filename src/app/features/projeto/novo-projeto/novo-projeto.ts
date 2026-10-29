import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFolderKanban } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ToastService } from '../../../core/services/toast-service';
import { IProjeto, StatusProjeto } from '../../../shared/interfaces/IProjeto';
import { ProjetoService } from '../../../core/services/projeto/projeto-service';

interface NovoProjetoContext {
  fazendaId: number;
  projeto?: IProjeto;
}

@Component({
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideFolderKanban })],
  selector: 'app-novo-projeto',
  styleUrl: './novo-projeto.css',
  templateUrl: './novo-projeto.html',
})
export class NovoProjeto {
  private readonly _dialogRef = inject<BrnDialogRef<IProjeto>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<NovoProjetoContext>();
  private readonly fb = inject(FormBuilder);
  private readonly projetoService = inject(ProjetoService);
  private toastService = inject(ToastService);

  modoEdicao = !!this._dialogContext.projeto;
  loading = signal(false);
  erro = signal<string | null>(null);

  statusOptions: { valor: StatusProjeto; label: string }[] = [
    { valor: 'PLANEJAMENTO', label: 'Planejamento' },
    { valor: 'ANDAMENTO', label: 'Andamento' },
    { valor: 'FINALIZADO', label: 'Finalizado' },
  ];

  statusItemToString = (value: StatusProjeto) =>
    this.statusOptions.find((o) => o.valor === value)?.label ?? '';

  form = this.fb.nonNullable.group({
    nome: [this._dialogContext.projeto?.nome ?? '', Validators.required],
    descricao: [this._dialogContext.projeto?.descricao ?? ''],
    observacoes: [this._dialogContext.projeto?.observacoes ?? ''],
    status: this.fb.nonNullable.control<StatusProjeto>(this._dialogContext.projeto?.status ?? 'PLANEJAMENTO'),
  });

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.loading()) return;
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();

    const request$ = this.modoEdicao
      ? this.projetoService.atualizar(this._dialogContext.projeto!.id, {
          nome: valores.nome,
          descricao: valores.descricao || undefined,
          observacoes: valores.observacoes || undefined,
          status: valores.status,
        })
      : this.projetoService.salvar({
          nome: valores.nome,
          descricao: valores.descricao || undefined,
          observacoes: valores.observacoes || undefined,
          fazendaId: this._dialogContext.fazendaId,
        });

    request$.subscribe({
      next: (projeto) => {
        this.loading.set(false);
        this.toastService.showSuccess(
          'Sucesso',
          this.modoEdicao ? 'Projeto atualizado com sucesso!' : 'Projeto registrado com sucesso!',
        );
        this._dialogRef.close(projeto);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set(this.modoEdicao ? 'Não foi possível atualizar o projeto' : 'Não foi possível salvar o projeto');
      },
    });
  }
}