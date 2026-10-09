import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { Usuario } from '../../shared/interfaces/IUsuario';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { UsuarioService } from '../../core/services/usuario-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { ToastService } from '../../core/services/toast-service';

@Component({
  imports: [ReactiveFormsModule, HlmDialogImports, HlmInputImports, HlmLabelImports, HlmButtonImports, HlmRadioGroupImports, NgIcon],
  providers: [provideIcons({ lucideUserPlus })],
  selector: 'app-dialog-novo-usuario',
  styleUrl: './dialog-novo-usuario.css',
  templateUrl: './dialog-novo-usuario.html',
})
export class DialogNovoUsuario {
  private readonly _dialogRef = inject<BrnDialogRef<Usuario>>(BrnDialogRef);
  private readonly fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService)
  private toastService = inject(ToastService)

  loading = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.group({
    nome: ['', [Validators.required]],
    admin: [false],
    numero: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[1-9]{2}9[0-9]{8}$/)
      ]
    ]
  });

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    this.usuarioService
      .salvarUsuario({
        nome: this.form.value.nome!,
        admin: this.form.value.admin ?? false,
        numero: this.form.value.numero ?? "",
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this._dialogRef.close(res);
        },
        error: (e) => {
          this.loading.set(false);
          this.toastService.showError("Erro", e.error.detail)
        }

      })
  }

}
