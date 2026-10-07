import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ISafra, StatusSafra } from '../../../shared/intefaces/ISafras';
import { anoAgricolaValidator } from '../../../shared/validators/anoAgricolaValidator';
import { lucideWheat } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ToastService } from '../../../core/services/toast-service';
import { SafraService } from '../../../core/services/safra/safra-service';

@Component({
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    HlmTextareaImports,
    HlmSelectImports,
    NgIcon
  ],
  providers: [provideIcons({ lucideWheat })],
  selector: 'app-nova-safra',
  styleUrl: './nova-safra.css',
  templateUrl: './nova-safra.html',
})
export class NovaSafra {
  private readonly _dialogRef = inject<BrnDialogRef<ISafra>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<{ fazendaId: number }>();
  private readonly fb = inject(FormBuilder);
  private readonly safraService = inject(SafraService);

  loading = signal(false);
  erro = signal<string | null>(null);

  statusOptions: { value: StatusSafra; label: string }[] = [
    { value: 'PLANEJAMENTO', label: 'Planejamento' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'COLHEITA', label: 'Colheita' },
    { value: 'ENCERRADO', label: 'Encerrado' },
  ];

  itemToString = (value: StatusSafra | null | undefined) =>
    this.statusOptions.find((o) => o.value === value)?.label || '';

  form = this.fb.group({
    nome: ['', [Validators.required]],
    cultura: ['', [Validators.required]],
    anoAgricola: ['', [Validators.required, anoAgricolaValidator()]],
    status: ['PLANEJAMENTO' as StatusSafra, [Validators.required]],
    areaTotal: [null as number | null, [Validators.required, Validators.min(0.01)]],
    observacoes: [''],
  });

  onStatusChange(status: StatusSafra | undefined | null) {
    if (status) {
      this.form.patchValue({ status });
    }
  }

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    this.safraService
      .salvarSafra({
        nome: this.form.value.nome!,
        cultura: this.form.value.cultura!,
        anoAgricola: this.form.value.anoAgricola!,
        status: this.form.value.status!,
        areaTotal: this.form.value.areaTotal!,
        observacoes: this.form.value.observacoes || null,
        fazendaId: this._dialogContext.fazendaId,
      })
      .subscribe({
        next: (safra) => {
          this.loading.set(false);
          this._dialogRef.close(safra);
        },
        error: () => {
          this.loading.set(false);
          this.erro.set('Não foi possível salvar a safra');
        },
      });
  }
}