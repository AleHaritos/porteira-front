import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePawPrint } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { AnimalRequest, SexoAnimal, TipoAnimal } from '../../../shared/interfaces/IAnimal';
import { ILote } from '../../../shared/interfaces/ILote';
import { IPiquete } from '../../../shared/interfaces/IPiquete';

interface CadastroUnicoAnimalContext {
  fazendaId: number;
  piqueteFixo: number | null;
  piquetes: IPiquete[];
  lotes: ILote[];
}

@Component({
  selector: 'app-cadastro-unico-animal',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmTextareaImports,
    HlmDatePickerImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePawPrint })],
  templateUrl: './cadastro-unico-animal.html',
  styleUrl: './cadastro-unico-animal.css',
})
export class CadastroUnicoAnimal implements OnInit {
  context = injectBrnDialogContext<CadastroUnicoAnimalContext>();

  private animalService = inject(AnimalService);
  private toastService = inject(ToastService);
  private dialogRef = inject(BrnDialogRef);

  salvando = signal(false);
  maxDate = new Date();

  piqueteId = signal<number | null>(null);
  tipo = signal<TipoAnimal>('GADO');
  loteId = signal<number | null>(null);
  sexo = signal<SexoAnimal | null>(null);
  brinco = signal('');
  raca = signal('');
  pesoRaw = signal('');
  idadeMesesRaw = signal('');
  dataCompraControl = new FormControl<Date | null>(null);
  valorCompraRaw = signal('');
  descricao = signal('');

  tipoOptions: { value: TipoAnimal; label: string }[] = [
    { value: 'GADO', label: 'Gado' },
    { value: 'BEZERRO', label: 'Bezerro' },
    { value: 'NOVILHA', label: 'Novilha' },
    { value: 'CAVALO', label: 'Cavalo' },
    { value: 'PORCO', label: 'Porco' },
    { value: 'GALINHA', label: 'Galinha' },
    { value: 'OUTRO', label: 'Outro' },
  ];

  sexoOptions: { value: SexoAnimal; label: string }[] = [
    { value: 'MACHO', label: 'Macho' },
    { value: 'FEMEA', label: 'Fêmea' },
  ];

  itemToStringTipo = (value: TipoAnimal | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label ?? '';

  itemToStringLote = (id: number | null | undefined) =>
    this.context.lotes.find((l) => l.id === id)?.nome ?? 'Sem lote';

  itemToStringPiquete = (id: number | null | undefined) =>
    this.context.piquetes.find((p) => p.id === id)?.nome ?? 'Selecione o piquete';

  itemToStringSexo = (value: SexoAnimal | null | undefined) =>
    this.sexoOptions.find((o) => o.value === value)?.label ?? 'Não informado';

  get precisaEscolherPiquete(): boolean {
    return !this.context.piqueteFixo;
  }

  ngOnInit(): void {
    if (this.context.piqueteFixo) {
      this.piqueteId.set(this.context.piqueteFixo);
    }
  }

  onTipoChange(value: TipoAnimal | null | undefined): void {
    if (value) this.tipo.set(value);
  }

  onLoteChange(value: number | null | undefined): void {
    this.loteId.set(value ?? null);
  }

  onPiqueteChange(value: number | null | undefined): void {
    this.piqueteId.set(value ?? null);
  }

  onSexoChange(value: SexoAnimal | null | undefined): void {
    this.sexo.set(value ?? null);
  }

  onBrincoInput(event: Event): void {
    this.brinco.set((event.target as HTMLInputElement).value);
  }

  onRacaInput(event: Event): void {
    this.raca.set((event.target as HTMLInputElement).value);
  }

  onPesoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizado = this.sanitizarNumero(input.value);
    input.value = sanitizado;
    this.pesoRaw.set(sanitizado);
  }

  onIdadeMesesInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizado = this.sanitizarNumero(input.value);
    input.value = sanitizado;
    this.idadeMesesRaw.set(sanitizado);
  }

  onValorCompraInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizado = this.sanitizarNumero(input.value);
    input.value = sanitizado;
    this.valorCompraRaw.set(sanitizado);
  }

  onDescricaoInput(event: Event): void {
    this.descricao.set((event.target as HTMLTextAreaElement).value);
  }

  private sanitizarNumero(valor: string): string {
    let normalizado = valor.replace(/[^\d,]/g, '');
    const partes = normalizado.split(',');
    if (partes.length > 2) {
      normalizado = partes[0] + ',' + partes.slice(1).join('');
    }
    return normalizado;
  }

  private parseDecimal(raw: string): number | null {
    if (!raw || !raw.trim()) return null;
    const normalizado = raw.replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(normalizado);
    return isNaN(numero) ? null : numero;
  }

  private calcularDataNascimento(): string | null {
    const meses = this.parseDecimal(this.idadeMesesRaw());
    if (meses == null || meses <= 0) return null;
    const data = new Date();
    data.setMonth(data.getMonth() - Math.round(meses));
    return data.toISOString().substring(0, 10);
  }

  salvar(): void {
    if (!this.piqueteId()) {
      this.toastService.showError('Erro', 'Selecione o piquete');
      return;
    }

    const dataCompra = this.dataCompraControl.value;

    const request: AnimalRequest = {
      tipo: this.tipo(),
      loteId: this.loteId(),
      piqueteId: this.piqueteId()!,
      fazendaId: this.context.fazendaId,
      descricao: this.descricao() || null,
      sexo: this.sexo(),
      dataNascimento: this.calcularDataNascimento(),
      dataCompra: dataCompra ? dataCompra.toISOString().split('T')[0] : null,
      valorCompra: this.parseDecimal(this.valorCompraRaw()),
      peso: this.parseDecimal(this.pesoRaw()),
      brinco: this.brinco() || null,
      raca: this.raca() || null,
    };

    this.salvando.set(true);
    this.animalService.salvar(request).subscribe({
      next: () => {
        this.salvando.set(false);
        this.toastService.showSuccess('Sucesso', 'Animal cadastrado com sucesso!');
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', 'Não foi possível cadastrar o animal');
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}