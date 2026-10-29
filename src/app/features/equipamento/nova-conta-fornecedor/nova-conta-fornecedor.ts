import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideReceipt } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { ContaFornecedorService } from '../../../core/services/equipamento/conta-fornecedor-service';
import { NegocioService } from '../../../core/services/negocio-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { ISafra } from '../../../shared/interfaces/ISafras';
import { IProjeto } from '../../../shared/interfaces/IProjeto';
import { ProjetoService } from '../../../core/services/projeto/projeto-service';

type Vinculo = 'NEGOCIO' | 'SAFRA' | 'PROJETO';

interface NovaContaFornecedorContext {
  fazendaId: number;
  fornecedorId: number;
}

@Component({
  selector: 'app-nova-conta-fornecedor',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmDatePickerImports,
    HlmSelectImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideReceipt })],
  styleUrl: './nova-conta-fornecedor.css',
  templateUrl: './nova-conta-fornecedor.html',
})
export class NovaContaFornecedor implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovaContaFornecedorContext>();
  private fb = inject(FormBuilder);
  private contaFornecedorService = inject(ContaFornecedorService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private projetoService = inject(ProjetoService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();
  valorRaw = signal<number | null>(null);

  vinculo = signal<Vinculo>('NEGOCIO');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  projetos = signal<IProjeto[]>([]);
  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);
  projetoSelecionado = signal<number | null>(null);

  form = this.fb.group({
    descricao: ['', Validators.required],
    data: [new Date(), Validators.required],
  });

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome ?? '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome ?? '';

  itemToStringProjeto = (value: number | null | undefined) =>
    this.projetos().find((p) => p.id === value)?.nome ?? '';

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;

    this.negocioService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });

    this.projetoService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (projetos) => this.projetos.set(projetos),
    });
  }

  onVinculoChange(vinculo: Vinculo): void {
    this.vinculo.set(vinculo);
    this.negocioSelecionado.set(null);
    this.safraSelecionada.set(null);
    this.projetoSelecionado.set(null);
  }

  onNegocioChange(id: number | null | undefined): void {
    this.negocioSelecionado.set(id ?? null);
  }

  onSafraChange(id: number | null | undefined): void {
    this.safraSelecionada.set(id ?? null);
  }

  onProjetoChange(id: number | null | undefined): void {
    this.projetoSelecionado.set(id ?? null);
  }

  onValorInput(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    this.valorRaw.set(digitos ? Number(digitos) / 100 : null);
  }

  formatarMoedaDisplay(valor: number | null): string {
    if (valor == null) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

   private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  salvar(): void {
    if (this.form.invalid || !this.valorRaw() || this.valorRaw()! <= 0) {
      this.toastService.showError('Erro', 'Preencha a descrição e um valor válido');
      return;
    }

    const vinculo = this.vinculo();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioSelecionado() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraSelecionada() : null;
    const projetoId = vinculo === 'PROJETO' ? this.projetoSelecionado() : null;

    if (!negocioId && !safraId && !projetoId) {
      this.toastService.showError('Erro', 'Selecione um negócio, uma safra ou um projeto');
      return;
    }

    this.salvando.set(true);

    this.contaFornecedorService
      .salvar({
        fornecedorId: this.context.fornecedorId,
        fazendaId: this.context.fazendaId,
        descricao: this.form.value.descricao!,
        data: this.formatarDataIso(this.form.value.data as Date),
        valor: this.valorRaw()!,
        negocioId,
        safraId,
        projetoId,
      })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Sucesso', 'Conta lançada com sucesso!');
          this.salvando.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.salvando.set(false);
          this.toastService.showError('Erro', 'Não foi possível lançar a conta');
        },
      });
  }
}