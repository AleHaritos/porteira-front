import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSyringe, lucideWheat } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { CuidadoAnimalService } from '../../../core/services/animais/cuidado-animal-service';
import { RacaoService } from '../../../core/services/animais/racao-service';
import { ToastService } from '../../../core/services/toast-service';
import { IAnimal } from '../../../shared/interfaces/IAnimal';
import { TipoCuidado, TipoVinculoCuidado } from '../../../shared/interfaces/ICuidadoAnimal';
import { ILote } from '../../../shared/interfaces/ILote';
import { IRacao } from '../../../shared/interfaces/IRacao';

interface NovoCuidadoAnimalContext {
  tipo: TipoCuidado;
  fazendaId: number;
  piqueteId: number;
  animais: IAnimal[];
  lotes: ILote[];
}

@Component({
  selector: 'app-novo-cuidado-animal',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideSyringe, lucideWheat })],
  styleUrl: './novo-cuidado-animal.css',
  templateUrl: './novo-cuidado-animal.html',
})
export class NovoCuidadoAnimal implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovoCuidadoAnimalContext>();
  private fb = inject(FormBuilder);
  private cuidadoService = inject(CuidadoAnimalService);
  private racaoService = inject(RacaoService);
  private toastService = inject(ToastService);

  salvando = signal(false);

  racoes = signal<IRacao[]>([]);

  vinculoTipo = signal<TipoVinculoCuidado>('PIQUETE');

  loteId = signal<number | null>(null);
  animalId = signal<number | null>(null);
  racaoId = signal<number | null>(null);
  quantidadeRacaoRaw = signal<string>('');

  custoRaw = signal<number | null>(null);

  form = this.fb.group({
    descricao: [''],
    data: [new Date().toISOString().substring(0, 10), Validators.required],
  });

  get titulo(): string {
    return this.context.tipo === 'VACINACAO' ? 'Vacinação' : 'Alimentação';
  }

  get icone(): string {
    return this.context.tipo === 'VACINACAO' ? 'lucideSyringe' : 'lucideWheat';
  }

  get ehAlimentacao(): boolean {
    return this.context.tipo === 'ALIMENTACAO';
  }

  itemToStringLote = (id: number | null | undefined) =>
    this.context.lotes.find((l) => l.id === id)?.nome ?? '';

  itemToStringAnimal = (id: number | null | undefined) => {
    const animal = this.context.animais.find((a) => a.id === id);
    if (!animal) return '';
    return animal.descricao
      ? `${this.tipoAnimalLabel(animal.tipo)} — ${animal.descricao}`
      : `${this.tipoAnimalLabel(animal.tipo)} #${animal.id}`;
  };

  itemToStringRacao = (id: number | null | undefined) =>
    this.racoes().find((r) => r.id === id)?.nome ?? 'Nenhuma';

  private tipoAnimalLabel(tipo: string): string {
    const labels: Record<string, string> = {
      GADO: 'Gado',
      BEZERRO: 'Bezerro',
      NOVILHA: 'Novilha',
      CAVALO: 'Cavalo',
      PORCO: 'Porco',
      GALINHA: 'Galinha',
      OUTRO: 'Outro',
    };
    return labels[tipo] ?? tipo;
  }

  ngOnInit(): void {
    if (this.ehAlimentacao) {
      this.racaoService.listarPorFazenda(this.context.fazendaId).subscribe({
        next: (res) => this.racoes.set(res),
      });
    }
  }

  selecionarVinculoTipo(tipo: TipoVinculoCuidado): void {
    this.vinculoTipo.set(tipo);
    this.loteId.set(null);
    this.animalId.set(null);
  }

  onLoteChange(id: number | null | undefined): void {
    this.loteId.set(id ?? null);
  }

  onAnimalChange(id: number | null | undefined): void {
    this.animalId.set(id ?? null);
  }

  onRacaoChange(id: number | null | undefined): void {
    this.racaoId.set(id ?? null);
    this.recalcularCustoPelaRacao();
  }

  onQuantidadeRacaoInput(valor: string): void {
    const normalizado = valor.replace(',', '.').replace(/[^\d.]/g, '');
    this.quantidadeRacaoRaw.set(normalizado);
    this.recalcularCustoPelaRacao();
  }

  private recalcularCustoPelaRacao(): void {
    const racao = this.racoes().find((r) => r.id === this.racaoId());
    const quantidade = Number(this.quantidadeRacaoRaw());
    if (racao && quantidade > 0) {
      this.custoRaw.set(Number((racao.custoTotal * quantidade).toFixed(2)));
    }
  }

  onCustoInput(valor: string): void {
    const normalizado = valor.replace(',', '.').replace(/[^\d.]/g, '');
    const n = Number(normalizado);
    this.custoRaw.set(normalizado === '' || isNaN(n) ? null : n);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid || !this.custoRaw() || this.custoRaw()! <= 0) {
      this.form.markAllAsTouched();
      this.toastService.showError('Erro', 'Preencha a data e o custo');
      return;
    }

    if (this.vinculoTipo() === 'LOTE' && !this.loteId()) {
      this.toastService.showError('Erro', 'Selecione o lote');
      return;
    }

    if (this.vinculoTipo() === 'ANIMAL' && !this.animalId()) {
      this.toastService.showError('Erro', 'Selecione o animal');
      return;
    }

    this.salvando.set(true);

    this.cuidadoService
      .salvar({
        tipo: this.context.tipo,
        vinculoTipo: this.vinculoTipo(),
        descricao: this.form.value.descricao || undefined,
        custo: this.custoRaw()!,
        data: this.form.value.data!,
        animalId: this.vinculoTipo() === 'ANIMAL' ? this.animalId()! : undefined,
        loteId: this.vinculoTipo() === 'LOTE' ? this.loteId()! : undefined,
        piqueteId: this.context.piqueteId,
        fazendaId: this.context.fazendaId,
        racaoId: this.racaoId() ?? undefined,
        quantidadeRacao: this.racaoId() ? Number(this.quantidadeRacaoRaw()) : undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', `${this.titulo} registrada com sucesso!`);
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', `Não foi possível registrar a ${this.titulo.toLowerCase()}`);
        },
      });
  }
}