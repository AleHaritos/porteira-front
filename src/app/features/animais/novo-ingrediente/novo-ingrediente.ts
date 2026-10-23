import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWheat } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { IngredienteService } from '../../../core/services/animais/ingrediente-service';
import { ToastService } from '../../../core/services/toast-service';
import { IIngrediente, IngredienteRequest } from '../../../shared/interfaces/IIngrediente';

interface NovoIngredienteContext {
  fazendaId: number;
  ingrediente: IIngrediente | null;
}

@Component({
  selector: 'app-novo-ingrediente',
  imports: [HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, NgIcon],
  providers: [provideIcons({ lucideWheat })],
  templateUrl: './novo-ingrediente.html',
  styleUrl: './novo-ingrediente.css',
})
export class NovoIngrediente implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovoIngredienteContext>();
  private ingredienteService = inject(IngredienteService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  nome = signal('');
  valorUnitarioRaw = signal('');
  unidade = signal('');

  get editando(): boolean {
    return !!this.context.ingrediente;
  }

  ngOnInit(): void {
    const i = this.context.ingrediente;
    if (i) {
      this.nome.set(i.nome);
      this.valorUnitarioRaw.set(String(i.valorUnitario).replace('.', ','));
      this.unidade.set(i.unidade ?? '');
    }
  }

  onNomeInput(event: Event): void {
    this.nome.set((event.target as HTMLInputElement).value);
  }

  onValorInput(event: Event): void {
    this.valorUnitarioRaw.set((event.target as HTMLInputElement).value);
  }

  onUnidadeInput(event: Event): void {
    this.unidade.set((event.target as HTMLInputElement).value);
  }

  private parseDecimal(raw: string): number {
    const normalizado = raw.replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(normalizado);
    return isNaN(numero) ? 0 : numero;
  }

  salvar(): void {
    if (!this.nome().trim()) {
      this.toastService.showError('Erro', 'Informe o nome do ingrediente');
      return;
    }
    const valor = this.parseDecimal(this.valorUnitarioRaw());
    if (valor <= 0) {
      this.toastService.showError('Erro', 'Informe o valor unitário do ingrediente');
      return;
    }

    const request: IngredienteRequest = {
      nome: this.nome().trim(),
      valorUnitario: valor,
      unidade: this.unidade() || null,
      fazendaId: this.context.fazendaId,
    };

    this.salvando.set(true);
    const operacao = this.editando
      ? this.ingredienteService.atualizar(this.context.ingrediente!.id, request)
      : this.ingredienteService.salvar(request);

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.toastService.showSuccess('Sucesso', `Ingrediente ${this.editando ? 'atualizado' : 'cadastrado'} com sucesso!`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', `Não foi possível ${this.editando ? 'atualizar' : 'cadastrar'} o ingrediente`);
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}