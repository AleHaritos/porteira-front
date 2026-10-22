import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCoins } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { IAnimal } from '../../../shared/interfaces/IAnimal';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';

interface VenderAnimaisContext {
  fazendaId: number;
  animais: IAnimal[];
}

type TipoVinculoFinanceiro = 'NEGOCIO' | 'SAFRA';

@Component({
  selector: 'app-vender-animais',
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
  providers: [provideIcons({ lucideCoins })],
  styleUrl: './vender-animais.css',
  templateUrl: './vender-animais.html',
})
export class VenderAnimais implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<VenderAnimaisContext>();
  private fb = inject(FormBuilder);
  private animalService = inject(AnimalService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private toastService = inject(ToastService);

  salvando = signal(false);

  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);

  tipoVinculoFinanceiro = signal<TipoVinculoFinanceiro>('NEGOCIO');
  negocioId = signal<number | null>(null);
  safraId = signal<number | null>(null);
  valorRaw = signal<number | null>(null);

  form = this.fb.group({
    descricao: [''],
    data: [new Date().toISOString().substring(0, 10), Validators.required],
  });

  tipoAnimalLabels: Record<string, string> = {
    GADO: 'Gado',
    BEZERRO: 'Bezerro',
    NOVILHA: 'Novilha',
    CAVALO: 'Cavalo',
    PORCO: 'Porco',
    GALINHA: 'Galinha',
    OUTRO: 'Outro',
  };

  itemToStringNegocio = (id: number | null | undefined) =>
    this.negocios().find((n) => n.id === id)?.nome ?? '';

  itemToStringSafra = (id: number | null | undefined) =>
    this.safras().find((s) => s.id === id)?.nome ?? '';

  animalLabel(animal: IAnimal): string {
    const tipo = this.tipoAnimalLabels[animal.tipo] ?? animal.tipo;
    return animal.descricao ? `${tipo} — ${animal.descricao}` : `${tipo} #${animal.id}`;
  }

  ngOnInit(): void {
    this.negocioService.listarTodosPorFazenda(this.context.fazendaId).subscribe({ next: (res) => this.negocios.set(res) });
    this.safraService.buscarSafrasPorFazenda(this.context.fazendaId, 0, 1000).subscribe({ next: (res) => this.safras.set(res.content) });
  }

  selecionarVinculoFinanceiro(tipo: TipoVinculoFinanceiro): void {
    this.tipoVinculoFinanceiro.set(tipo);
    this.negocioId.set(null);
    this.safraId.set(null);
  }

  onNegocioChange(id: number | null | undefined): void {
    this.negocioId.set(id ?? null);
  }

  onSafraChange(id: number | null | undefined): void {
    this.safraId.set(id ?? null);
  }

  onValorInput(valor: string): void {
    const normalizado = valor.replace(',', '.').replace(/[^\d.]/g, '');
    const n = Number(normalizado);
    this.valorRaw.set(normalizado === '' || isNaN(n) ? null : n);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid || !this.valorRaw() || this.valorRaw()! <= 0) {
      this.form.markAllAsTouched();
      this.toastService.showError('Erro', 'Preencha a data e o valor da venda');
      return;
    }

    if (this.tipoVinculoFinanceiro() === 'NEGOCIO' && !this.negocioId()) {
      this.toastService.showError('Erro', 'Selecione o negócio');
      return;
    }

    if (this.tipoVinculoFinanceiro() === 'SAFRA' && !this.safraId()) {
      this.toastService.showError('Erro', 'Selecione a safra');
      return;
    }

    this.salvando.set(true);

    this.animalService
      .venderAnimais({
        animalIds: this.context.animais.map((a) => a.id),
        valor: this.valorRaw()!,
        data: this.form.value.data!,
        descricao: this.form.value.descricao || undefined,
        fazendaId: this.context.fazendaId,
        negocioId: this.tipoVinculoFinanceiro() === 'NEGOCIO' ? this.negocioId()! : undefined,
        safraId: this.tipoVinculoFinanceiro() === 'SAFRA' ? this.safraId()! : undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', `${this.context.animais.length} animal(is) vendido(s) com sucesso!`);
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível registrar a venda');
        },
      });
  }
}