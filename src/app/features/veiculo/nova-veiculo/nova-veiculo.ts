import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { ToastService } from '../../../core/services/toast-service';
import { VeiculoService } from '../../../core/services/veiculos/veiculo-service';
import { IVeiculo, TipoVeiculo, VeiculoRequest } from '../../../shared/interfaces/IVeiculos';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCar } from '@ng-icons/lucide';

interface VeiculoDialogContext {
  fazendaId: number;
  veiculo?: IVeiculo;
}

@Component({
  selector: 'app-nova-veiculo',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmDatePickerImports,
    HlmTextareaImports,
    NgIcon
  ],
  providers: [provideIcons({ lucideCar })],
  styleUrl: './nova-veiculo.css',
  templateUrl: './nova-veiculo.html',
})
export class NovaVeiculo implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  private context = injectBrnDialogContext<VeiculoDialogContext>();
  private fb = inject(FormBuilder);
  private veiculoService = inject(VeiculoService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  maxDate = new Date();
  editando = !!this.context.veiculo;

  tipoOptions: { value: TipoVeiculo; label: string }[] = [
    { value: 'CAMINHAO', label: 'Caminhão' },
    { value: 'TRATOR', label: 'Trator' },
    { value: 'CARRO', label: 'Carro' },
    { value: 'MOTO', label: 'Moto' },
  ];

  tipoSelecionado = signal<TipoVeiculo>((this.context.veiculo?.tipo as TipoVeiculo) ?? 'CARRO');

  itemToStringTipo = (value: TipoVeiculo | null | undefined) =>
    this.tipoOptions.find((o) => o.value === value)?.label || '';

  form = this.fb.group({
    nome: [this.context.veiculo?.nome ?? '', Validators.required],
    placa: [
      this.context.veiculo?.placa ?? '',
      [Validators.required, Validators.pattern(/^[A-Za-z]{3}\d[A-Za-z\d]\d{2}$/)],
    ],
    dataCompra: [
      this.context.veiculo ? new Date(this.context.veiculo.dataCompra) : (new Date() as Date | null),
      Validators.required,
    ],
    observacao: [this.context.veiculo?.observacao ?? ''],
  });

  ngOnInit(): void {
    this.form.get('placa')?.valueChanges.subscribe((valor) => {
      if (valor && valor !== valor.toUpperCase()) {
        this.form.get('placa')?.setValue(valor.toUpperCase(), { emitEvent: false });
      }
    });
  }

  onTipoChange(tipo: TipoVeiculo | null | undefined) {
    if (tipo) this.tipoSelecionado.set(tipo);
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

    const { nome, placa, dataCompra, observacao } = this.form.value;

    const request: VeiculoRequest = {
      nome: nome!,
      placa: placa!,
      dataCompra: this.formatarDataIso(dataCompra!),
      observacao: observacao || undefined,
      tipo: this.tipoSelecionado(),
      fazendaId: this.context.fazendaId,
    };

    this.salvando.set(true);

    const veiculoId = this.context.veiculo?.id;
    const chamada = veiculoId
      ? this.veiculoService.atualizar(veiculoId, request)
      : this.veiculoService.salvar(request);

    chamada.subscribe({
      next: () => {
        this.toastService.showSuccess('Sucesso', veiculoId ? 'Veículo atualizado com sucesso!' : 'Veículo criado com sucesso!');
        this.salvando.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', veiculoId ? 'Não foi possível atualizar o veículo' : 'Não foi possível criar o veículo');
      },
    });
  }
}