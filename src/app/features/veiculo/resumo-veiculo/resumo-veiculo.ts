import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCar, lucideFuel, lucideWrench } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { AbastecimentoService } from '../../../core/services/veiculos/abastecimento-service';
import { ManutencaoService } from '../../../core/services/veiculos/manutencao-service';
import { IAbastecimento, IAbastecimentoResumo } from '../../../shared/interfaces/IAbastecimento';
import { IManutencao, IManutencaoResumo } from '../../../shared/interfaces/IManutencao';
import { IVeiculo } from '../../../shared/interfaces/IVeiculos';
import { DatePipe } from '@angular/common';

interface ResumoVeiculoContext {
  veiculo: IVeiculo;
  fazendaId: number;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-resumo-veiculo',
  imports: [ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmDatePickerImports, HlmLabelImports, NgIcon, DatePipe],
  providers: [provideIcons({ lucideCar, lucideFuel, lucideWrench })],
  templateUrl: './resumo-veiculo.html',
  styleUrl: './resumo-veiculo.css',
})
export class ResumoVeiculo implements OnInit {
  context = injectBrnDialogContext<ResumoVeiculoContext>();

  private dialogRef = inject(BrnDialogRef);
  private abastecimentoService = inject(AbastecimentoService);
  private manutencaoService = inject(ManutencaoService);

  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(this.primeiroDiaDoMes());
  dataFimControl = new FormControl<Date | null>(new Date());

  carregando = signal(false);
  resumoAbastecimento = signal<IAbastecimentoResumo | null>(null);
  resumoManutencao = signal<IManutencaoResumo | null>(null);
  abastecimentos = signal<IAbastecimento[]>([]);
  manutencoes = signal<IManutencao[]>([]);

  readonly formatarValor = (valor: number) => moeda.format(valor);

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  ngOnInit(): void {
    this.carregar();
    this.dataInicioControl.valueChanges.subscribe(() => this.carregar());
    this.dataFimControl.valueChanges.subscribe(() => this.carregar());
  }

  carregar(): void {
    const dataInicio = this.dataInicioControl.value;
    const dataFim = this.dataFimControl.value;
    if (!dataInicio || !dataFim) return;

    const dataInicioStr = dataInicio.toISOString().split('T')[0];
    const dataFimStr = dataFim.toISOString().split('T')[0];
    const veiculoId = this.context.veiculo.id;

    this.carregando.set(true);

    this.abastecimentoService
      .buscarPorFazenda(this.context.fazendaId, 0, 100, veiculoId, dataInicioStr, dataFimStr)
      .subscribe({ next: (res) => this.abastecimentos.set(res.content) });

    this.abastecimentoService
      .buscarResumo(this.context.fazendaId, veiculoId, dataInicioStr, dataFimStr)
      .subscribe({ next: (res) => this.resumoAbastecimento.set(res) });

    this.manutencaoService
      .buscarPorVeiculoEPeriodo(veiculoId, dataInicioStr, dataFimStr, 0, 100)
      .subscribe({
        next: (res) => {
          this.manutencoes.set(res.content);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });

    this.manutencaoService
      .buscarResumoPorVeiculo(veiculoId, dataInicioStr, dataFimStr)
      .subscribe({ next: (res) => this.resumoManutencao.set(res) });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}