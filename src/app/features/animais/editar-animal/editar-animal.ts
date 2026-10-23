import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSquarePen } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { AnimalRequest, IAnimal, SexoAnimal, TipoAnimal } from '../../../shared/interfaces/IAnimal';
import { ILote } from '../../../shared/interfaces/ILote';

interface EditarAnimalContext {
  animal: IAnimal;
  fazendaId: number;
  lotes: ILote[];
  tipoOptions: { value: TipoAnimal; label: string }[];
}

@Component({
  selector: 'app-editar-animal',
  imports: [
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideSquarePen })],
  templateUrl: './editar-animal.html',
  styleUrl: './editar-animal.css',
})
export class EditarAnimal implements OnInit {
  context = injectBrnDialogContext<EditarAnimalContext>();

  private animalService = inject(AnimalService);
  private toastService = inject(ToastService);
  private dialogRef = inject(BrnDialogRef);

  salvando = signal(false);

  tipo = signal<TipoAnimal>('OUTRO');
  loteId = signal<number | null>(null);
  descricao = signal('');
  sexo = signal<SexoAnimal | null>(null);
  dataNascimento = signal<string | null>(null);
  dataCompra = signal<string | null>(null);
  valorCompraRaw = signal('');
  pesoRaw = signal('');
  brinco = signal('');
  raca = signal('');

  sexoOptions: { value: SexoAnimal; label: string }[] = [
    { value: 'MACHO', label: 'Macho' },
    { value: 'FEMEA', label: 'Fêmea' },
  ];

  itemToStringLote = (id: number | null | undefined) =>
    this.context.lotes.find((l) => l.id === id)?.nome ?? 'Sem lote';

  itemToStringTipo = (value: TipoAnimal | null | undefined) =>
    this.context.tipoOptions.find((o) => o.value === value)?.label ?? '';

  itemToStringSexo = (value: SexoAnimal | null | undefined) =>
    this.sexoOptions.find((o) => o.value === value)?.label ?? 'Não informado';

  ngOnInit(): void {
    const a = this.context.animal;
    this.tipo.set(a.tipo);
    this.loteId.set(a.loteId);
    this.descricao.set(a.descricao ?? '');
    this.sexo.set(a.sexo);
    this.dataNascimento.set(a.dataNascimento);
    this.dataCompra.set(a.dataCompra);
    this.valorCompraRaw.set(a.valorCompra != null ? String(a.valorCompra).replace('.', ',') : '');
    this.pesoRaw.set(a.peso != null ? String(a.peso).replace('.', ',') : '');
    this.brinco.set(a.brinco ?? '');
    this.raca.set(a.raca ?? '');
  }

  onTipoChange(value: TipoAnimal | null | undefined): void {
    if (value) this.tipo.set(value);
  }

  onLoteChange(value: number | null | undefined): void {
    this.loteId.set(value ?? null);
  }

  onSexoChange(value: SexoAnimal | null | undefined): void {
    this.sexo.set(value ?? null);
  }

  onDescricaoInput(event: Event): void {
    this.descricao.set((event.target as HTMLTextAreaElement).value);
  }

  onDataNascimentoInput(event: Event): void {
    this.dataNascimento.set((event.target as HTMLInputElement).value || null);
  }

  onDataCompraInput(event: Event): void {
    this.dataCompra.set((event.target as HTMLInputElement).value || null);
  }

  onValorCompraInput(event: Event): void {
    this.valorCompraRaw.set((event.target as HTMLInputElement).value);
  }

  onPesoInput(event: Event): void {
    this.pesoRaw.set((event.target as HTMLInputElement).value);
  }

  onBrincoInput(event: Event): void {
    this.brinco.set((event.target as HTMLInputElement).value);
  }

  onRacaInput(event: Event): void {
    this.raca.set((event.target as HTMLInputElement).value);
  }

  private parseDecimal(raw: string): number | null {
    if (!raw || !raw.trim()) return null;
    const normalizado = raw.replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(normalizado);
    return isNaN(numero) ? null : numero;
  }

  salvar(): void {
    const request: AnimalRequest = {
      tipo: this.tipo(),
      loteId: this.loteId(),
      piqueteId: this.context.animal.piqueteId,
      fazendaId: this.context.fazendaId,
      descricao: this.descricao() || null,
      sexo: this.sexo(),
      dataNascimento: this.dataNascimento(),
      dataCompra: this.dataCompra(),
      valorCompra: this.parseDecimal(this.valorCompraRaw()),
      peso: this.parseDecimal(this.pesoRaw()),
      brinco: this.brinco() || null,
      raca: this.raca() || null,
    };

    this.salvando.set(true);
    this.animalService.atualizar(this.context.animal.id, request).subscribe({
      next: () => {
        this.salvando.set(false);
        this.toastService.showSuccess('Sucesso', 'Animal atualizado com sucesso!');
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', 'Não foi possível atualizar o animal');
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}