import { Component, inject, OnInit, signal } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { FazendaService } from '../../../core/services/fazenda-service';
import { UsuarioService } from '../../../core/services/usuario-service';
import { Usuario } from '../../../shared/intefaces/IUsuario';
import { IFazenda } from '../../../shared/intefaces/IFazenda';
import { ToastService } from '../../../core/services/toast-service';

interface CompartilharFazendaContext {
  fazenda: IFazenda;
}

@Component({
  selector: 'app-compartilhar-fazenda-dialog',
  imports: [HlmDialogImports, HlmButtonImports, HlmLabelImports, HlmSelectImports, BrnSelectImports, NgIcon],
  providers: [provideIcons({ lucideUserPlus })],
  styleUrl: './compartilhar-fazenda-dialog.css',
  templateUrl: './compartilhar-fazenda-dialog.html',
})
export class CompartilharFazendaDialog implements OnInit {
  private readonly _dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);
  protected readonly context = injectBrnDialogContext<CompartilharFazendaContext>();
  private readonly usuarioService = inject(UsuarioService);
  private readonly fazendaService = inject(FazendaService);
  private readonly toastService = inject(ToastService);

  usuarios = signal<Usuario[]>([]);
  usuarioSelecionadoId = signal<number | null>(null);
  carregando = signal(true);
  loading = signal(false);
  erro = signal<string | null>(null);

  itemToStringUsuario = (value: number | null | undefined) => {
    if (value == null) return '';
    return this.usuarios().find((u) => u.id === value)?.nome ?? '';
  };

  ngOnInit() {
    this.usuarioService.listarTodosMeusCadastros().subscribe({
      next: (res) => {
        const jaColaboradores = new Set((this.context.fazenda.colaboradores ?? []).map((c) => c.id));
        this.usuarios.set(res.filter((u) => !jaColaboradores.has(u.id)));
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  onUsuarioChange(usuarioId: number | null | undefined) {
    this.usuarioSelecionadoId.set(usuarioId ?? null);
  }

  cancelar() {
    this._dialogRef.close();
  }

  compartilhar() {
    const usuario = this.usuarios().find((u) => u.id === this.usuarioSelecionadoId());
    if (!usuario || this.loading()) return;

    this.loading.set(true);
    this.erro.set(null);

    this.fazendaService.adicionarColaboradorFazenda(this.context.fazenda.id, usuario.numero).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.showSuccess('Sucesso', `Fazenda compartilhada com ${usuario.nome}!`);
        this._dialogRef.close(true);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set('Não foi possível compartilhar a fazenda');
      },
    });
  }
}