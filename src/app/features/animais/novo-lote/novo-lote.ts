import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePawPrint } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { LoteService } from '../../../core/services/animais/lote-service';
import { ToastService } from '../../../core/services/toast-service';
import { ILote } from '../../../shared/interfaces/ILote';

interface NovoLoteContext {
  fazendaId: number;
  lote: ILote | null;
}

@Component({
  selector: 'app-novo-lote',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmTextareaImports, NgIcon],
  providers: [provideIcons({ lucidePawPrint })],
  styleUrl: './novo-lote.css',
  templateUrl: './novo-lote.html',
})
export class NovoLote implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovoLoteContext>();
  private fb = inject(FormBuilder);
  private loteService = inject(LoteService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  editando = !!this.context.lote;

  form = this.fb.group({
    nome: ['', Validators.required],
    quantidade: [null as number | null, [Validators.required, Validators.min(1)]],
    observacoes: [''],
  });

  ngOnInit(): void {
    if (this.context.lote) {
      this.form.patchValue({
        nome: this.context.lote.nome,
        quantidade: this.context.lote.quantidade,
        observacoes: this.context.lote.observacoes,
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nome, quantidade, observacoes } = this.form.value;
    const request = {
      nome: nome!,
      quantidade: quantidade!,
      observacoes: observacoes || undefined,
      fazendaId: this.context.fazendaId,
    };

    this.salvando.set(true);

    const onSuccess = () => {
      this.toastService.showSuccess('Sucesso', this.editando ? 'Lote atualizado com sucesso!' : 'Lote criado com sucesso!');
      this.salvando.set(false);
      this.dialogRef.close(true);
    };

    const onError = () => {
      this.salvando.set(false);
      this.toastService.showError('Erro', 'Não foi possível salvar o lote');
    };

    if (this.editando) {
      this.loteService.atualizar(this.context.lote!.id, request).subscribe({ next: onSuccess, error: onError });
    } else {
      this.loteService.salvar(request).subscribe({ next: onSuccess, error: onError });
    }
  }
}
