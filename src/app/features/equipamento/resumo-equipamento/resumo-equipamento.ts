import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWrench } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { EquipamentoService } from '../../../core/services/equipamento/equipamento-service';
import { ManutencaoEquipamentoService } from '../../../core/services/equipamento/manutencao-equipamento-service';
import { ToastService } from '../../../core/services/toast-service';
import { IEquipamento } from '../../../shared/interfaces/IEquipamento';
import { IManutencaoEquipamento } from '../../../shared/interfaces/IManutencaoEquipamento';

interface ResumoEquipamentoContext {
  equipamento: IEquipamento;
  fazendaId: number;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-resumo-equipamento',
  imports: [DatePipe, ReactiveFormsModule, HlmDialogImports, HlmButtonImports, HlmDatePickerImports, HlmLabelImports, NgIcon],
  providers: [provideIcons({ lucideWrench })],
  templateUrl: './resumo-equipamento.html',
  styleUrl: './resumo-equipamento.css',
})
export class ResumoEquipamento implements OnInit {
  context = injectBrnDialogContext<ResumoEquipamentoContext>();

  private dialogRef = inject(BrnDialogRef);
  private manutencaoEquipamentoService = inject(ManutencaoEquipamentoService);
  private equipamentoService = inject(EquipamentoService);
  private toastService = inject(ToastService);

  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(this.primeiroDiaDoMes());
  dataFimControl = new FormControl<Date | null>(new Date());
  observacaoControl = new FormControl<string>('');

  carregando = signal(false);
  salvandoObservacao = signal(false);
  manutencoes = signal<IManutencaoEquipamento[]>([]);

  totalValor = computed(() => this.manutencoes().reduce((soma, m) => soma + m.valor, 0));

  readonly formatarValor = (valor: number) => moeda.format(valor);

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  ngOnInit(): void {
    this.observacaoControl.setValue(this.context.equipamento.observacao ?? '');
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

    this.carregando.set(true);
    this.manutencaoEquipamentoService
      .buscarPorFazenda(this.context.fazendaId, this.context.equipamento.id, dataInicioStr, dataFimStr, 0, 100)
      .subscribe({
        next: (res) => {
          this.manutencoes.set(res.content);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
  }

  salvarObservacao(): void {
    const equipamento = this.context.equipamento;
    this.salvandoObservacao.set(true);
    this.equipamentoService
      .atualizar(equipamento.id, {
        nome: equipamento.nome,
        dataCompra: equipamento.dataCompra,
        valorCompra: equipamento.valorCompra,
        observacao: this.observacaoControl.value ?? undefined,
        fazendaId: this.context.fazendaId,
      })
      .subscribe({
        next: (atualizado) => {
          equipamento.observacao = atualizado.observacao;
          this.salvandoObservacao.set(false);
          this.toastService.showSuccess('Sucesso', 'Observação salva com sucesso!');
        },
        error: () => {
          this.salvandoObservacao.set(false);
          this.toastService.showError('Erro', 'Não foi possível salvar a observação');
        },
      });
  }

  formatarPagamento(forma: string): string {
    return forma === 'A_VISTA' ? 'À vista' : 'Fornecedor (fiado)';
  }

  fechar(): void {
    this.dialogRef.close();
  }
}