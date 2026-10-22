import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSquarePen, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { PiqueteService } from '../../../core/services/animais/piquete-service';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { IPiquete } from '../../../shared/interfaces/IPiquete';
import { NovoPiquete } from '../novo-piquete/novo-piquete';

@Component({
  selector: 'app-piquetes-tab',
  imports: [CommonModule, HlmTableImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideSquarePen, lucideTrash2 })],
  styleUrl: './piquetes-tab.css',
  templateUrl: './piquetes-tab.html',
})
export class PiquetesTab implements OnInit {
  fazendaId = input.required<number>();

  private piqueteService = inject(PiqueteService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  piquetes = signal<IPiquete[]>([]);
  carregando = signal(false);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.piqueteService.listarPorFazenda(this.fazendaId()).subscribe({
      next: (res) => {
        this.piquetes.set(res);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os piquetes');
      },
    });
  }

  abrirDetalhe(piquete: IPiquete): void {
    this.router.navigate(['piquete', piquete.id], { relativeTo: this.route });
  }

  abrirNovoPiquete(piquete?: IPiquete, event?: Event): void {
    event?.stopPropagation();

    const dialogRef = this.dialogService.open(NovoPiquete, {
      context: { fazendaId: this.fazendaId(), piquete: piquete ?? null },
      contentClass: 'sm:!max-w-[520px], sm:!min-w-[420px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  inativar(piquete: IPiquete, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Inativar Piquete',
        mensagem: `Deseja realmente inativar o piquete "${piquete.nome}"?`,
        textoConfirmar: 'Inativar',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.piqueteService.inativar(piquete.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Piquete inativado com sucesso!');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível inativar o piquete'),
        });
      }
    });
  }
}