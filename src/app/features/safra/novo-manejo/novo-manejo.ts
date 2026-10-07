import { Component, inject, OnInit, signal } from '@angular/core';
import { IManejo, TipoManejo } from '../../../shared/intefaces/IManejo';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ProdutoSafraService } from '../../../core/services/safra/produto-safra-service';
import { IProdutoSafra } from '../../../shared/intefaces/IProdutoSafra';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { ToastService } from '../../../core/services/toast-service';
import { ManejoService } from '../../../core/services/safra/manejo-service';

interface NovoManejoContext {
  talhaoId: number;
  safraId: number;
  manejo?: IManejo;
}

@Component({
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    HlmTextareaImports,
    HlmSelectImports,
    HlmDatePickerImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideClipboardList })],
  selector: 'app-novo-manejo',
  styleUrl: './novo-manejo.css',
  templateUrl: './novo-manejo.html',
})
export class NovoManejo implements OnInit {
  private readonly _dialogRef = inject<BrnDialogRef<IManejo>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<NovoManejoContext>();
  private readonly fb = inject(FormBuilder);
  private readonly manejoService = inject(ManejoService);
  private readonly produtoSafraService = inject(ProdutoSafraService);
  private toastService = inject(ToastService);

  modoEdicao = !!this._dialogContext.manejo;
  loading = signal(false);
  erro = signal<string | null>(null);
  produtos = signal<IProdutoSafra[]>([]);

  minDate = new Date(2020, 0, 1);
  maxDate = new Date();

  tipoOptions: { value: TipoManejo; label: string }[] = [
    { value: 'PREPARO_DO_SOLO', label: 'Preparo do solo' },
    { value: 'PLANTIO', label: 'Plantio' },
    { value: 'ADUBACAO', label: 'Adubação' },
    { value: 'PULVERIZACAO', label: 'Pulverização' },
    { value: 'IRRIGACAO', label: 'Irrigação' },
    { value: 'COLHEITA', label: 'Colheita' },
    { value: 'OUTROS', label: 'Outros' },
  ];

  itemToStringTipo = (value: TipoManejo | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label || '';

  itemToStringProduto = (value: number | null | undefined) => {
    if (value == null) return 'Nenhum';
    return this.produtos().find((p) => p.id === value)?.nome || '';
  };

  private parseData(data: string): Date {
    return new Date(`${data}T00:00:00`);
  }

  form = this.fb.group({
    tipo: [(this._dialogContext.manejo?.tipo ?? 'PLANTIO') as TipoManejo, [Validators.required]],
    data: [
      this._dialogContext.manejo ? this.parseData(this._dialogContext.manejo.data) : (null as Date | null),
      [Validators.required],
    ],
    descricao: [this._dialogContext.manejo?.descricao ?? ''],
    observacoes: [this._dialogContext.manejo?.observacoes ?? ''],
    produtoSafraId: [(this._dialogContext.manejo as any)?.produtoSafraId ?? (null as number | null)],
    quantidadeProduto: [this._dialogContext.manejo?.quantidadeProduto ?? (null as number | null)],
  });

  ngOnInit() {
    this.produtoSafraService.listarTodosPorSafra(this._dialogContext.safraId).subscribe((res) => {
      this.produtos.set(res);
    });

    this.form.get('produtoSafraId')?.valueChanges.subscribe((produtoId) => {
      const quantidadeControl = this.form.get('quantidadeProduto');
      if (produtoId != null) {
        quantidadeControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        quantidadeControl?.setValue(null);
        quantidadeControl?.clearValidators();
      }
      quantidadeControl?.updateValueAndValidity();
    });
  }

  onTipoChange(tipo: TipoManejo | null | undefined) {
    if (tipo) {
      this.form.patchValue({ tipo });
    }
  }

  onProdutoChange(produtoSafraId: number | null | undefined) {
    this.form.patchValue({ produtoSafraId: produtoSafraId ?? null });
  }

  private formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  cancelar() {
    this._dialogRef.close();
  }

  salvar() {
    if (this.loading()) return;
    if (this.form.invalid) return;

    this.loading.set(true);
    this.erro.set(null);

    const payload = {
      tipo: this.form.value.tipo!,
      data: this.formatarData(this.form.value.data!),
      descricao: this.form.value.descricao || undefined,
      observacoes: this.form.value.observacoes || undefined,
      produtoSafraId: this.form.value.produtoSafraId ?? undefined,
      quantidadeProduto: this.form.value.quantidadeProduto ?? undefined,
    };

    const request$ = this.modoEdicao
      ? this.manejoService.atualizar(this._dialogContext.manejo!.id, payload)
      : this.manejoService.salvar({ ...payload, talhaoId: this._dialogContext.talhaoId });

    request$.subscribe({
      next: (manejo) => {
        this.loading.set(false);
        this.toastService.showSuccess(
          'Sucesso',
          this.modoEdicao ? 'Manejo atualizado com sucesso!' : 'Manejo registrado com sucesso!',
        );
        this._dialogRef.close(manejo);
      },
      error: () => {
        this.loading.set(false);
        this.erro.set(this.modoEdicao ? 'Não foi possível atualizar o manejo' : 'Não foi possível salvar o manejo');
      },
    });
  }
}