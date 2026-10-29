import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSprout } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { ColheitaTalhaoService } from '../../../core/services/safra/colheita-talhao-service';
import { ToastService } from '../../../core/services/toast-service';
import { IColheitaTalhao } from '../../../shared/interfaces/IColheitaTalhao';

interface ColheitaDialogContext {
  talhaoId: number;
  colheita?: IColheitaTalhao;
}

@Component({
  selector: 'app-novo-colheita',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmDatePickerImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideSprout })],
  styleUrl: './novo-colheita.css',
  templateUrl: './novo-colheita.html',
})
export class NovoColheita implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<ColheitaDialogContext>();
  private fb = inject(FormBuilder);
  private colheitaTalhaoService = inject(ColheitaTalhaoService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  editando = computed(() => this.context.colheita ?? null);
  tituloDialog = computed(() => (this.editando() ? 'Editar colheita' : 'Nova colheita'));

  quantidadeRaw = signal<number | null>(null);
  valorUnitarioRaw = signal<number | null>(null);

  form = this.fb.group({
    descricao: [''],
    data: [null as Date | null],
  });

  readonly formatarInputDisplay = (valor: number | null) => {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  ngOnInit(): void {
    const colheita = this.context.colheita;
    if (colheita) {
      this.form.patchValue({
        descricao: colheita.descricao || '',
        data: colheita.data ? this.parseDataIso(colheita.data) : null,
      });
      this.quantidadeRaw.set(colheita.quantidadeColhida);
      this.valorUnitarioRaw.set(colheita.valorUnitario);
    }
  }

  onQuantidadeInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.quantidadeRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  onValorUnitarioInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.valorUnitarioRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private parseDataIso(iso: string): Date {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (!this.quantidadeRaw() || this.quantidadeRaw()! <= 0 || !this.valorUnitarioRaw() || this.valorUnitarioRaw()! <= 0) {
      this.toastService.showError('Erro', 'Preencha a quantidade e o valor unitário');
      return;
    }

    this.salvando.set(true);
    const { descricao, data } = this.form.value;
    const colheita = this.editando();

    if (colheita) {
      this.colheitaTalhaoService
        .atualizar(colheita.id, {
          descricao: descricao || undefined,
          data: data ? this.formatarDataIso(data) : undefined,
          quantidadeColhida: this.quantidadeRaw()!,
          valorUnitario: this.valorUnitarioRaw()!,
        })
        .subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Colheita atualizada');
            this.dialogRef.close(true);
          },
          error: () => {
            this.salvando.set(false);
            this.toastService.showError('Erro', 'Não foi possível atualizar a colheita');
          },
        });
      return;
    }

    this.colheitaTalhaoService
      .salvar({
        talhaoId: this.context.talhaoId,
        descricao: descricao || undefined,
        data: data ? this.formatarDataIso(data) : undefined,
        quantidadeColhida: this.quantidadeRaw()!,
        valorUnitario: this.valorUnitarioRaw()!,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Colheita adicionada');
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível adicionar a colheita');
        },
      });
  }
}