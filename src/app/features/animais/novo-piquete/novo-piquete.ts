import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { PiqueteService } from '../../../core/services/animais/piquete-service';
import { ToastService } from '../../../core/services/toast-service';
import { IPiquete } from '../../../shared/interfaces/IPiquete';

interface NovoPiqueteContext {
  fazendaId: number;
  piquete: IPiquete | null;
}

@Component({
  selector: 'app-novo-piquete',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, NgIcon],
  providers: [provideIcons({ lucideMapPin })],
  styleUrl: './novo-piquete.css',
  templateUrl: './novo-piquete.html',
})
export class NovoPiquete implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovoPiqueteContext>();
  private fb = inject(FormBuilder);
  private piqueteService = inject(PiqueteService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  editando = !!this.context.piquete;
  areaRaw = signal<number | null>(null);

  form = this.fb.group({
    nome: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.context.piquete) {
      this.form.patchValue({ nome: this.context.piquete.nome });
      this.areaRaw.set(this.context.piquete.areaHectares);
    }
  }

  onAreaInput(valor: string): void {
    const normalizado = valor.replace(',', '.').replace(/[^\d.]/g, '');
    const n = Number(normalizado);
    this.areaRaw.set(normalizado === '' || isNaN(n) ? null : n);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid || !this.areaRaw() || this.areaRaw()! <= 0) {
      this.form.markAllAsTouched();
      this.toastService.showError('Erro', 'Preencha o nome e a área do piquete');
      return;
    }

    const request = {
      nome: this.form.value.nome!,
      areaHectares: this.areaRaw()!,
      fazendaId: this.context.fazendaId,
    };

    this.salvando.set(true);

    const onSuccess = () => {
      this.toastService.showSuccess('Sucesso', this.editando ? 'Piquete atualizado com sucesso!' : 'Piquete criado com sucesso!');
      this.salvando.set(false);
      this.dialogRef.close(true);
    };

    const onError = () => {
      this.salvando.set(false);
      this.toastService.showError('Erro', 'Não foi possível salvar o piquete');
    };

    if (this.editando) {
      this.piqueteService.atualizar(this.context.piquete!.id, request).subscribe({ next: onSuccess, error: onError });
    } else {
      this.piqueteService.salvar(request).subscribe({ next: onSuccess, error: onError });
    }
  }
}