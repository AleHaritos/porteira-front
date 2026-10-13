import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWrench } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { EquipamentoService } from '../../../core/services/equipamento/equipamento-service';
import { ToastService } from '../../../core/services/toast-service';
import { IEquipamento } from '../../../shared/interfaces/IEquipamento';

interface EquipamentoDialogContext {
  fazendaId: number;
  equipamento?: IEquipamento;
}

@Component({
  selector: 'app-nova-equipamento',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmDatePickerImports, NgIcon],
  providers: [provideIcons({ lucideWrench })],
  styleUrl: './nova-equipamento.css',
  templateUrl: './nova-equipamento.html',
})
export class NovaEquipamento {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<EquipamentoDialogContext>();
  private fb = inject(FormBuilder);
  private equipamentoService = inject(EquipamentoService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();
  editando = !!this.context.equipamento;

  valorCompraRaw = signal<number | null>(this.context.equipamento?.valorCompra ?? null);

  form = this.fb.group({
    nome: [this.context.equipamento?.nome ?? '', Validators.required],
    dataCompra: [this.context.equipamento ? new Date(this.context.equipamento.dataCompra) : new Date(), Validators.required],
    observacao: [this.context.equipamento?.observacao ?? ''],
  });

  onValorCompraInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.valorCompraRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  formatarMoedaDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  salvar(): void {
    if (this.form.invalid || !this.valorCompraRaw() || this.valorCompraRaw()! <= 0) {
      this.form.markAllAsTouched();
      this.toastService.showError('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    this.salvando.set(true);
    const request = {
      nome: this.form.value.nome!,
      dataCompra: (this.form.value.dataCompra as Date).toISOString().split('T')[0],
      valorCompra: this.valorCompraRaw()!,
      observacao: this.form.value.observacao ?? undefined,
      fazendaId: this.context.fazendaId,
    };

    const obs = this.editando
      ? this.equipamentoService.atualizar(this.context.equipamento!.id, request)
      : this.equipamentoService.salvar(request);

    obs.subscribe({
      next: () => {
        this.salvando.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', 'Não foi possível salvar o equipamento');
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}