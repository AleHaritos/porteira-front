import { Component, inject, OnInit, signal } from '@angular/core';
import { TipoCombustivel } from '../../../shared/interfaces/IAbastecimento';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFuel } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { EstoqueCombustivelService } from '../../../core/services/veiculos/estoque-combustivel-service';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';

type Vinculo = 'NEGOCIO' | 'SAFRA';

interface ReabastecerEstoqueDialogContext {
  fazendaId: number;
}

@Component({
  selector: 'app-reabastecer-estoque',
  imports: [
    ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmInputImports,
    HlmLabelImports, HlmSelectImports, HlmDatePickerImports, HlmTextareaImports, NgIcon,
  ],
  providers: [provideIcons({ lucideFuel })],
  styleUrl: './reabastecer-estoque.css',
  templateUrl: './reabastecer-estoque.html',
})
export class ReabastecerEstoque implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<ReabastecerEstoqueDialogContext>();
  private fb = inject(FormBuilder);
  private estoqueCombustivelService = inject(EstoqueCombustivelService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();

  tipoCombustivel = signal<TipoCombustivel>('DIESEL');
  tipoCombustivelOptions: { value: TipoCombustivel; label: string }[] = [
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'GASOLINA', label: 'Gasolina' },
    { value: 'ETANOL', label: 'Etanol' },
  ];

  itemToStringTipoCombustivel = (value: TipoCombustivel | null | undefined) =>
    this.tipoCombustivelOptions.find((o) => o.value === value)?.label || '';

  litrosRaw = signal<number | null>(null);
  valorPorLitroRaw = signal<number | null>(null);

  form = this.fb.group({
    data: [new Date() as Date | null, Validators.required],
    observacao: [''],
  });

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;
  }

  onTipoCombustivelChange(tipo: TipoCombustivel | null | undefined) {
    if (tipo) this.tipoCombustivel.set(tipo);
  }

  onLitrosInput(valor: string) {
    const normalizado = valor.replace(',', '.').replace(/[^0-9.]/g, '');
    this.litrosRaw.set(normalizado ? Number(normalizado) : null);
  }

  onValorPorLitroInput(valor: string) {
    const digitos = valor.replace(/\D/g, '');
    this.valorPorLitroRaw.set(digitos ? Number(digitos) / 1000 : null);
  }

  formatarValorPorLitroDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const litros = this.litrosRaw();
    if (!litros || litros <= 0) {
      this.toastService.showError('Erro', 'Informe a quantidade de litros');
      return;
    }

    const valorPorLitro = this.valorPorLitroRaw();
    if (!valorPorLitro || valorPorLitro <= 0) {
      this.toastService.showError('Erro', 'Informe o valor por litro');
      return;
    }

    const { data, observacao } = this.form.value;

    this.salvando.set(true);
    this.estoqueCombustivelService
      .reabastecer({
        fazendaId: this.context.fazendaId,
        tipoCombustivel: this.tipoCombustivel(),
        litros,
        valorPorLitro,
        data: this.formatarDataIso(data!),
        observacao: observacao || undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Estoque reabastecido com sucesso!');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível reabastecer o estoque');
        },
      });
  }
}
