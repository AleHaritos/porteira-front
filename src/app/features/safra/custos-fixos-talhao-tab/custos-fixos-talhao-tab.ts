import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { CustoFixoTalhaoService } from '../../../core/services/safra/custo-fixo-talhao-service';
import { ToastService } from '../../../core/services/toast-service';
import { ICustoFixoTalhao } from '../../../shared/interfaces/ICustoFixoTalhao';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-custos-fixos-talhao-tab',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmTableImports, NgIcon],
  providers: [provideIcons({ lucideTrash2, lucidePlus })],
  styleUrl: './custos-fixos-talhao-tab.css',
  templateUrl: './custos-fixos-talhao-tab.html',
})
export class CustosFixosTalhaoTab implements OnInit {
  talhaoId = input.required<number>();

  custosFixosAlterado = output<void>();

  private custoFixoTalhaoService = inject(CustoFixoTalhaoService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  custos = signal<ICustoFixoTalhao[]>([]);
  carregando = signal(false);
  salvando = signal(false);
  valorRaw = signal<number | null>(null);

  totalCustos = computed(() => this.custos().reduce((soma, c) => soma + c.valor, 0));

  readonly formatarValor = (valor: number) => moeda.format(valor);

  form = this.fb.group({
    descricao: ['', Validators.required],
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.custoFixoTalhaoService.listarPorTalhao(this.talhaoId()).subscribe({
      next: (custos) => {
        this.custos.set(custos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  onValorInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.valorRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  formatarMoedaDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  adicionar(): void {
    const descricao = this.form.value.descricao;
    if (!descricao || !this.valorRaw() || this.valorRaw()! <= 0) {
      this.toastService.showError('Erro', 'Preencha a descrição e um valor válido');
      return;
    }

    this.salvando.set(true);

    this.custoFixoTalhaoService
      .salvar({ talhaoId: this.talhaoId(), descricao, valor: this.valorRaw()! })
      .subscribe({
        next: () => {
          this.form.reset();
          this.valorRaw.set(null);
          this.salvando.set(false);
          this.toastService.showSuccess('Sucesso', 'Custo fixo adicionado');
          this.carregar();
          this.custosFixosAlterado.emit();
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível adicionar o custo fixo');
        },
      });
  }

  excluir(custo: ICustoFixoTalhao): void {
    this.custoFixoTalhaoService.excluir(custo.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Sucesso', 'Custo fixo removido');
        this.carregar();
        this.custosFixosAlterado.emit();
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível remover o custo fixo'),
    });
  }
}