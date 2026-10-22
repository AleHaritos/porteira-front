import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePawPrint, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { TipoAnimal } from '../../../shared/interfaces/IAnimal';
import { ILote } from '../../../shared/interfaces/ILote';
import { IPiquete } from '../../../shared/interfaces/IPiquete';

interface NovoAnimalEmMassaContext {
  fazendaId: number;
  piquetes: IPiquete[];
  lotes: ILote[];
  piqueteFixo?: number | null;
}

let proximoIdLinha = 1;

interface LinhaAnimalComId {
  idLinha: number;
  tipo: TipoAnimal;
  loteId: number | null;
  descricao: string;
}

@Component({
  selector: 'app-novo-animal-em-massa',
  imports: [HlmDialogImports, HlmButtonImports, HlmLabelImports, HlmSelectImports, HlmInputImports, NgIcon],
  providers: [provideIcons({ lucidePawPrint, lucidePlus, lucideTrash2 })],
  styleUrl: './novo-animal-em-massa.css',
  templateUrl: './novo-animal-em-massa.html',
})
export class NovoAnimalEmMassa implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovoAnimalEmMassaContext>();
  private animalService = inject(AnimalService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  piqueteId = signal<number | null>(null);

  linhas = signal<LinhaAnimalComId[]>([this.criarLinha()]);

  tipoOptions: { value: TipoAnimal; label: string }[] = [
    { value: 'GADO', label: 'Gado' },
    { value: 'BEZERRO', label: 'Bezerro' },
    { value: 'NOVILHA', label: 'Novilha' },
    { value: 'CAVALO', label: 'Cavalo' },
    { value: 'PORCO', label: 'Porco' },
    { value: 'GALINHA', label: 'Galinha' },
    { value: 'OUTRO', label: 'Outro' },
  ];

  itemToStringPiquete = (id: number | null | undefined) =>
    this.context.piquetes.find((p) => p.id === id)?.nome ?? '';

  itemToStringLote = (id: number | null | undefined) =>
    this.context.lotes.find((l) => l.id === id)?.nome ?? 'Sem lote';

  itemToStringTipo = (value: TipoAnimal | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label ?? '';

  ngOnInit(): void {
    if (this.context.piqueteFixo) {
      this.piqueteId.set(this.context.piqueteFixo);
    }
  }

  get piqueteFixoNome(): string {
    return this.itemToStringPiquete(this.context.piqueteFixo);
  }

  private criarLinha(): LinhaAnimalComId {
    return { idLinha: proximoIdLinha++, tipo: 'GADO', loteId: null, descricao: '' };
  }

  onPiqueteChange(id: number | null | undefined): void {
    this.piqueteId.set(id ?? null);
  }

  onTipoLinhaChange(idLinha: number, tipo: TipoAnimal | null | undefined): void {
    if (!tipo) return;
    this.linhas.update((linhas) => linhas.map((l) => (l.idLinha === idLinha ? { ...l, tipo } : l)));
  }

  onLoteLinhaChange(idLinha: number, loteId: number | null | undefined): void {
    this.linhas.update((linhas) => linhas.map((l) => (l.idLinha === idLinha ? { ...l, loteId: loteId ?? null } : l)));
  }

  onDescricaoLinhaChange(idLinha: number, descricao: string): void {
    this.linhas.update((linhas) => linhas.map((l) => (l.idLinha === idLinha ? { ...l, descricao } : l)));
  }

  adicionarLinha(): void {
    this.linhas.update((linhas) => [...linhas, this.criarLinha()]);
  }

  removerLinha(idLinha: number): void {
    if (this.linhas().length === 1) return;
    this.linhas.update((linhas) => linhas.filter((l) => l.idLinha !== idLinha));
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (!this.piqueteId()) {
      this.toastService.showError('Erro', 'Selecione o piquete');
      return;
    }

    if (this.linhas().length === 0) {
      this.toastService.showError('Erro', 'Adicione pelo menos um animal');
      return;
    }

    this.salvando.set(true);

    this.animalService
      .salvarEmMassa({
        fazendaId: this.context.fazendaId,
        piqueteId: this.piqueteId()!,
        animais: this.linhas().map((l) => ({
          tipo: l.tipo,
          loteId: l.loteId ?? undefined,
          descricao: l.descricao.trim() || undefined,
        })),
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', `${this.linhas().length} animal(is) cadastrado(s) com sucesso!`);
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível cadastrar os animais');
        },
      });
  }
}