import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { CuidadoAnimalService } from '../../../core/services/animais/cuidado-animal-service';
import { LoteService } from '../../../core/services/animais/lote-service';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { IAnimal } from '../../../shared/interfaces/IAnimal';
import { ICuidadoAnimal, TipoCuidado } from '../../../shared/interfaces/ICuidadoAnimal';
import { ILote } from '../../../shared/interfaces/ILote';
import { NovoCuidadoAnimal } from '../novo-cuidado-animal/novo-cuidado-animal';

@Component({
  selector: 'app-cuidado-animal-tab',
  imports: [CommonModule, HlmTableImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideTrash2 })],
  styleUrl: './cuidado-animal-tab.css',
  templateUrl: './cuidado-animal-tab.html',
})
export class CuidadoAnimalTab implements OnInit {
  tipo = input.required<TipoCuidado>();
  fazendaId = input.required<number>();
  piqueteId = input.required<number>();

  private cuidadoService = inject(CuidadoAnimalService);
  private animalService = inject(AnimalService);
  private loteService = inject(LoteService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  registros = signal<ICuidadoAnimal[]>([]);
  animaisDoPiquete = signal<IAnimal[]>([]);
  lotesDoPiquete = signal<ILote[]>([]);
  carregando = signal(false);

  get titulo(): string {
    return this.tipo() === 'VACINACAO' ? 'Vacinação' : 'Alimentação';
  }

  ngOnInit(): void {
    this.carregar();
    this.carregarAnimaisDoPiquete();
  }

  carregar(): void {
    this.carregando.set(true);
    this.cuidadoService.listarPorPiquete(this.piqueteId(), this.tipo()).subscribe({
      next: (res) => {
        this.registros.set(res);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', `Não foi possível carregar os registros de ${this.titulo.toLowerCase()}`);
      },
    });
  }

  carregarAnimaisDoPiquete(): void {
    this.animalService.listarPorFazenda(this.fazendaId(), this.piqueteId(), null, null, 0, 1000).subscribe({
      next: (res) => {
        this.animaisDoPiquete.set(res.content);

        this.loteService.listarPorFazenda(this.fazendaId()).subscribe({
          next: (lotes) => {
            const idsLotesComAnimalAqui = new Set(
              res.content.map((a) => a.loteId).filter((id): id is number => id != null),
            );
            this.lotesDoPiquete.set(lotes.filter((l) => idsLotesComAnimalAqui.has(l.id)));
          },
        });
      },
    });
  }

  vinculoLabel(registro: ICuidadoAnimal): string {
    if (registro.vinculoTipo === 'PIQUETE') return 'Todo o piquete';
    if (registro.vinculoTipo === 'LOTE') return `Lote: ${registro.loteNome}`;
    return `Animal: ${registro.animalDescricao || '#' + registro.animalId}`;
  }

  abrirNovoRegistro(): void {
    const dialogRef = this.dialogService.open(NovoCuidadoAnimal, {
      context: {
        tipo: this.tipo(),
        fazendaId: this.fazendaId(),
        piqueteId: this.piqueteId(),
        animais: this.animaisDoPiquete(),
        lotes: this.lotesDoPiquete(),
      },
      contentClass: 'sm:!max-w-[640px], sm:!min-w-[520px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  excluir(registro: ICuidadoAnimal): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: `Excluir registro de ${this.titulo.toLowerCase()}`,
        mensagem: 'Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.',
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[420px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.cuidadoService.excluir(registro.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Registro excluído com sucesso!');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível excluir o registro'),
        });
      }
    });
  }
}