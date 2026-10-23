import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideArrowRight, lucideCheck, lucideCircleHelp, lucideLayers, lucideMapPin, lucideMars, lucideMinus, lucidePlus, lucideTag, lucideVenus } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { ToastService } from '../../../core/services/toast-service';
import { AnimalEmMassaItem, SexoAnimal, TipoAnimal } from '../../../shared/interfaces/IAnimal';
import { ILote } from '../../../shared/interfaces/ILote';
import { IPiquete } from '../../../shared/interfaces/IPiquete';

interface CadastroLoteAnimaisContext {
  fazendaId: number;
  piqueteFixo: number | null;
  piquetes: IPiquete[];
  lotes: ILote[];
}

@Component({
  selector: 'app-cadastro-lote-animais',
  imports: [HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmSelectImports, HlmTextareaImports, NgIcon],
  providers: [provideIcons({ lucideArrowLeft, lucideArrowRight, lucideCheck, lucideLayers, lucideMars, lucideVenus, lucideCircleHelp, lucideMinus, lucidePlus, lucideTag, lucideMapPin })],
  templateUrl: './cadastro-lote-animais.html',
  styleUrl: './cadastro-lote-animais.css',
})
export class CadastroLoteAnimais implements OnInit {
  context = injectBrnDialogContext<CadastroLoteAnimaisContext>();

  private animalService = inject(AnimalService);
  private toastService = inject(ToastService);
  private dialogRef = inject(BrnDialogRef);

  salvando = signal(false);
  passo = signal(1);
  totalPassos = 4;

  piqueteId = signal<number | null>(null);
  tipo = signal<TipoAnimal>('GADO');
  loteId = signal<number | null>(null);
  sexo = signal<SexoAnimal | null>(null);
  pesoRaw = signal('');
  idadeMesesRaw = signal('');
  raca = signal('');
  descricao = signal('');
  quantidadeRaw = signal('1');
  valorPagoRaw = signal('');

  tipoOptions: { value: TipoAnimal; label: string }[] = [
    { value: 'GADO', label: 'Gado' },
    { value: 'BEZERRO', label: 'Bezerro' },
    { value: 'NOVILHA', label: 'Novilha' },
    { value: 'CAVALO', label: 'Cavalo' },
    { value: 'PORCO', label: 'Porco' },
    { value: 'GALINHA', label: 'Galinha' },
    { value: 'OUTRO', label: 'Outro' },
  ];

  itemToStringTipo = (value: TipoAnimal | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label ?? '';

  itemToStringLote = (id: number | null | undefined) =>
    this.context.lotes.find((l) => l.id === id)?.nome ?? 'Sem lote';

  itemToStringPiquete = (id: number | null | undefined) =>
    this.context.piquetes.find((p) => p.id === id)?.nome ?? 'Selecione o piquete';

  get precisaEscolherPiquete(): boolean {
    return !this.context.piqueteFixo;
  }

  get quantidade(): number {
    const n = parseInt(this.quantidadeRaw(), 10);
    return isNaN(n) || n < 1 ? 1 : n;
  }

  get valorPorAnimal(): number | null {
    const total = this.parseDecimal(this.valorPagoRaw());
    if (total == null || total <= 0) return null;
    return Math.round((total / this.quantidade) * 100) / 100;
  }

  ngOnInit(): void {
    if (this.context.piqueteFixo) {
      this.piqueteId.set(this.context.piqueteFixo);
    }
  }

  incrementarQuantidade(): void {
    this.quantidadeRaw.set(String(this.quantidade + 1));
  }

  decrementarQuantidade(): void {
    if (this.quantidade > 1) {
      this.quantidadeRaw.set(String(this.quantidade - 1));
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

  selecionarSexo(valor: SexoAnimal | null): void {
    this.sexo.set(valor);
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

  onValorPagoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizado = this.sanitizarNumero(input.value);
    input.value = sanitizado;
    this.valorPagoRaw.set(sanitizado);
  }

  onRacaInput(event: Event): void {
    this.raca.set((event.target as HTMLInputElement).value);
  }

  onDescricaoInput(event: Event): void {
    this.descricao.set((event.target as HTMLTextAreaElement).value);
  }

  onQuantidadeInput(event: Event): void {
    this.quantidadeRaw.set((event.target as HTMLInputElement).value);
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

  formatarMoeda(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  podeAvancar(): boolean {
    if (this.passo() === 1) return !!this.piqueteId();
    if (this.passo() === 3) {
      return this.parseDecimal(this.pesoRaw()) != null && this.parseDecimal(this.idadeMesesRaw()) != null;
    }
    return true;
  }

  avancar(): void {
    if (!this.podeAvancar()) {
      if (this.passo() === 1) {
        this.toastService.showError('Erro', 'Selecione o piquete de destino');
      } else if (this.passo() === 3) {
        this.toastService.showError('Erro', 'Informe o peso e a idade (meses)');
      }
      return;
    }
    if (this.passo() < this.totalPassos) this.passo.set(this.passo() + 1);
  }

  voltar(): void {
    if (this.passo() > 1) this.passo.set(this.passo() - 1);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    if (!this.piqueteId()) {
      this.toastService.showError('Erro', 'Selecione o piquete de destino');
      return;
    }

    const item: AnimalEmMassaItem = {
      tipo: this.tipo(),
      loteId: this.loteId(),
      descricao: this.descricao() || null,
      sexo: this.sexo(),
      peso: this.parseDecimal(this.pesoRaw()),
      dataNascimento: this.calcularDataNascimento(),
      raca: this.raca() || null,
      valorCompra: this.valorPorAnimal,
    };

    const animais: AnimalEmMassaItem[] = Array.from({ length: this.quantidade }, () => ({ ...item }));

    this.salvando.set(true);
    this.animalService
      .salvarEmMassa({
        fazendaId: this.context.fazendaId,
        piqueteId: this.piqueteId()!,
        animais,
      })
      .subscribe({
        next: () => {
          this.salvando.set(false);
          this.toastService.showSuccess('Sucesso', `${animais.length} animal(is) cadastrado(s) com sucesso!`);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível cadastrar os animais');
        },
      });
  }
}