import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2, lucideWheat } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { RacaoService } from '../../../core/services/animais/racao-service';
import { ToastService } from '../../../core/services/toast-service';
import { IIngrediente } from '../../../shared/interfaces/IIngrediente';
import { IRacao, RacaoRequest, RacaoRequestItem } from '../../../shared/interfaces/IRacao';

interface LinhaIngrediente {
  ingredienteId: number | null;
  quantidadeRaw: string;
}

interface NovaRacaoContext {
  fazendaId: number;
  ingredientes: IIngrediente[];
  racao: IRacao | null;
}

@Component({
  selector: 'app-nova-racao',
  imports: [HlmDialogImports, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmSelectImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideTrash2, lucideWheat })],
  templateUrl: './nova-racao.html',
  styleUrl: './nova-racao.css',
})
export class NovaRacao implements OnInit {
  context = injectBrnDialogContext<NovaRacaoContext>();

  private racaoService = inject(RacaoService);
  private toastService = inject(ToastService);
  private dialogRef = inject(BrnDialogRef);

  salvando = signal(false);
  nome = signal('');
  linhas = signal<LinhaIngrediente[]>([{ ingredienteId: null, quantidadeRaw: '' }]);

  get editando(): boolean {
    return !!this.context.racao;
  }

  itemToStringIngrediente = (id: number | null | undefined) =>
    this.context.ingredientes.find((i) => i.id === id)?.nome ?? 'Selecione o ingrediente';

  custoTotalPreview = computed(() => {
    return this.linhas().reduce((total, linha) => {
      const ingrediente = this.context.ingredientes.find((i) => i.id === linha.ingredienteId);
      const quantidade = this.parseDecimal(linha.quantidadeRaw);
      if (!ingrediente || quantidade <= 0) return total;
      return total + ingrediente.valorUnitario * quantidade;
    }, 0);
  });

  ngOnInit(): void {
    const r = this.context.racao;
    if (r) {
      this.nome.set(r.nome);
      this.linhas.set(
        r.ingredientes.map((item) => ({
          ingredienteId: item.ingredienteId,
          quantidadeRaw: String(item.quantidade).replace('.', ','),
        })),
      );
    }
  }

  onNomeInput(event: Event): void {
    this.nome.set((event.target as HTMLInputElement).value);
  }

  onIngredienteChange(index: number, value: number | null | undefined): void {
    const novas = [...this.linhas()];
    novas[index] = { ...novas[index], ingredienteId: value ?? null };
    this.linhas.set(novas);
  }

  onQuantidadeInput(index: number, event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    const novas = [...this.linhas()];
    novas[index] = { ...novas[index], quantidadeRaw: valor };
    this.linhas.set(novas);
  }

  adicionarLinha(): void {
    this.linhas.set([...this.linhas(), { ingredienteId: null, quantidadeRaw: '' }]);
  }

  removerLinha(index: number): void {
    const novas = this.linhas().filter((_, i) => i !== index);
    this.linhas.set(novas.length > 0 ? novas : [{ ingredienteId: null, quantidadeRaw: '' }]);
  }

  private parseDecimal(raw: string): number {
    if (!raw || !raw.trim()) return 0;
    const normalizado = raw.replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(normalizado);
    return isNaN(numero) ? 0 : numero;
  }

  salvar(): void {
    if (!this.nome().trim()) {
      this.toastService.showError('Erro', 'Informe o nome da ração');
      return;
    }

    const itens: RacaoRequestItem[] = this.linhas()
      .filter((l) => l.ingredienteId != null && this.parseDecimal(l.quantidadeRaw) > 0)
      .map((l) => ({ ingredienteId: l.ingredienteId!, quantidade: this.parseDecimal(l.quantidadeRaw) }));

    if (itens.length === 0) {
      this.toastService.showError('Erro', 'Adicione ao menos um ingrediente com quantidade válida');
      return;
    }

    const request: RacaoRequest = {
      nome: this.nome().trim(),
      fazendaId: this.context.fazendaId,
      ingredientes: itens,
    };

    this.salvando.set(true);
    const operacao = this.editando
      ? this.racaoService.atualizar(this.context.racao!.id, request)
      : this.racaoService.salvar(request);

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.toastService.showSuccess('Sucesso', `Ração ${this.editando ? 'atualizada' : 'cadastrada'} com sucesso!`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', `Não foi possível ${this.editando ? 'atualizar' : 'cadastrar'} a ração`);
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}