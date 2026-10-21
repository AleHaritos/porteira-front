import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ColheitaTalhaoService } from '../../../core/services/safra/colheita-talhao-service';
import { ToastService } from '../../../core/services/toast-service';
import { IColheitaTalhao } from '../../../shared/interfaces/IColheitaTalhao';
import { ITalhao } from '../../../shared/interfaces/ITalhao';

const numeroFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-colheita-talhao-tab',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmTableImports, NgIcon],
  providers: [provideIcons({ lucideTrash2, lucidePlus })],
  styleUrl: './colheita-talhao-tab.css',
  templateUrl: './colheita-talhao-tab.html',
})
export class ColheitaTalhaoTab implements OnInit {
  talhaoId = input.required<number>();
  talhao = input<ITalhao | null>(null);
  colheitaAlterada = output<void>();

  private colheitaTalhaoService = inject(ColheitaTalhaoService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  colheitas = signal<IColheitaTalhao[]>([]);
  carregando = signal(false);
  salvando = signal(false);

  quantidadeRaw = signal<number | null>(null);
  valorUnitarioRaw = signal<number | null>(null);

  form = this.fb.group({
    descricao: [''],
  });

  areaHectares = computed(() => this.talhao()?.areaHectares ?? 0);

  producaoTotal = computed(() => this.colheitas().reduce((soma, c) => soma + c.quantidadeColhida, 0));
  receitaTotal = computed(() => this.colheitas().reduce((soma, c) => soma + c.quantidadeColhida * c.valorUnitario, 0));
  producaoPorHa = computed(() => (this.areaHectares() ? this.producaoTotal() / this.areaHectares() : 0));
  receitaPorHa = computed(() => (this.areaHectares() ? this.receitaTotal() / this.areaHectares() : 0));

  readonly formatarSacas = (valor: number) => `${numeroFormatter.format(valor)} sc`;
  readonly formatarValor = (valor: number) => moeda.format(valor);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.colheitaTalhaoService.listarPorTalhao(this.talhaoId()).subscribe({
      next: (colheitas) => {
        this.colheitas.set(colheitas);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  onQuantidadeInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.quantidadeRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  onValorUnitarioInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.valorUnitarioRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  formatarInputDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  adicionar(): void {
    if (!this.quantidadeRaw() || this.quantidadeRaw()! <= 0 || !this.valorUnitarioRaw() || this.valorUnitarioRaw()! <= 0) {
      this.toastService.showError('Erro', 'Preencha a quantidade e o valor unitário');
      return;
    }

    this.salvando.set(true);

    this.colheitaTalhaoService
      .salvar({
        talhaoId: this.talhaoId(),
        descricao: this.form.value.descricao || undefined,
        quantidadeColhida: this.quantidadeRaw()!,
        valorUnitario: this.valorUnitarioRaw()!,
      })
      .subscribe({
        next: () => {
          this.form.reset();
          this.quantidadeRaw.set(null);
          this.valorUnitarioRaw.set(null);
          this.salvando.set(false);
          this.toastService.showSuccess('Sucesso', 'Colheita adicionada');
          this.carregar();
          this.colheitaAlterada.emit();
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível adicionar a colheita');
        },
      });
  }

  excluir(colheita: IColheitaTalhao): void {
    this.colheitaTalhaoService.excluir(colheita.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Sucesso', 'Colheita removida');
        this.carregar();
        this.colheitaAlterada.emit();
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível remover a colheita'),
    });
  }
}