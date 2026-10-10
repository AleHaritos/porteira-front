import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWheat } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ISafra, StatusSafra } from '../../../shared/interfaces/ISafras';
import { SafraService } from '../../../core/services/safra/safra-service';
import { anoAgricolaValidator } from '../../../shared/validators/anoAgricolaValidator';
import { ToastService } from '../../../core/services/toast-service';

interface NovaSafraContext {
  fazendaId?: number;
  safra?: ISafra;
}

@Component({
  selector: 'app-nova-safra',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmTextareaImports,
    HlmSelectImports,
    BrnSelectImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideWheat })],
  styleUrl: './nova-safra.css',
  templateUrl: './nova-safra.html',
})

export class NovaSafra {
  private fb = inject(FormBuilder);
  private safraService = inject(SafraService);
  private dialogRef = inject(BrnDialogRef);
  private toastService = inject(ToastService);
  private context = injectBrnDialogContext<NovaSafraContext>();

  modoEdicao = !!this.context.safra;
  loading = signal(false);
  erro = signal<string | null>(null);

  statusOptions: { value: StatusSafra; label: string }[] = [
    { value: 'PLANEJAMENTO', label: 'Planejamento' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'COLHEITA', label: 'Colheita' },
    { value: 'ENCERRADO', label: 'Encerrado' },
  ];

  itemToString = (value: StatusSafra) =>
    this.statusOptions.find((opcao) => opcao.value === value)?.label ?? '';

  form = this.fb.nonNullable.group({
    nome: [this.context.safra?.nome ?? '', Validators.required],
    cultura: [this.context.safra?.cultura ?? ''],
    anoAgricola: [this.context.safra?.anoAgricola ?? '', [Validators.required, anoAgricolaValidator]],
    areaTotal: [this.context.safra?.areaTotal ?? 0, [Validators.required, Validators.min(0.01)]],
    status: [(this.context.safra?.status ?? 'PLANEJAMENTO') as StatusSafra, Validators.required],
    observacoes: [this.context.safra?.observacoes ?? ''],
  });

  onStatusChange(valor: StatusSafra | null | undefined) {
    this.form.patchValue({ status: valor ?? 'PLANEJAMENTO' });
  }

  salvar() {
    if (this.loading()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();

    const request$ = this.modoEdicao
      ? this.safraService.atualizar(this.context.safra!.id, valores)
      : this.safraService.salvarSafra({ ...valores, fazendaId: this.context.fazendaId! });

    request$.subscribe({
      next: (safra) => {
        this.loading.set(false);
        this.toastService.showSuccess("Sucesso", "Safra salva com sucesso!")
        this.dialogRef.close(safra);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set('Não foi possível salvar a safra. Tente novamente.');
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}