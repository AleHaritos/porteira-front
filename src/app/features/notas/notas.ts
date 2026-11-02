import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideFolderOpen,
  lucideLeaf,
  lucidePlus,
  lucideSearch,
  lucideStickyNote,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NotaService } from '../../core/services/notas/nota-service';
import { ToastService } from '../../core/services/toast-service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { INota, OpcaoVinculo, TipoVinculo } from '../../shared/interfaces/INota';
import { NovaNota } from './nova-nota/nova-nota';
import { idDoVinculo, nomeDoVinculo, normalizarTexto, tipoDaNota, TIPOS_VINCULO } from '../../core/services/notas/nota-tipos';

interface ParteTitulo {
  texto: string;
  destaque: boolean;
}

@Component({
  selector: 'app-notas',
  imports: [DatePipe, HlmButtonImports, HlmInputImports, HlmSelectImports, NgIcon],
  providers: [
    provideIcons({
      lucideBriefcase,
      lucideFolderOpen,
      lucideLeaf,
      lucidePlus,
      lucideSearch,
      lucideStickyNote,
      lucideTrash2,
      lucideX,
    }),
  ],
  styleUrl: './notas.css',
  templateUrl: './notas.html',
})
export class Notas implements OnInit {
  private route = inject(ActivatedRoute);
  private notaService = inject(NotaService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  readonly tipos = TIPOS_VINCULO;
  readonly tipoDaNota = tipoDaNota;
  readonly esqueleto = [1, 2, 3, 4, 5, 6];

  fazendaId = signal<number | null>(null);
  notas = signal<INota[]>([]);
  carregando = signal(true);

  busca = signal('');
  tipoFiltro = signal<TipoVinculo | null>(null);
  vinculoFiltro = signal<number | null>(null);

  tipoAtual = computed(() => this.tipos.find((t) => t.valor === this.tipoFiltro()) ?? null);

  // As opções do filtro vêm das próprias notas (mesmo critério da tela de tarefas)
  opcoesDoTipo = computed<OpcaoVinculo[]>(() => {
    const tipo = this.tipoFiltro();
    if (!tipo) return [];

    const itens = new Map<number, string>();
    for (const nota of this.notas()) {
      if (tipoDaNota(nota) !== tipo) continue;
      const id = idDoVinculo(nota);
      if (id != null) itens.set(id, nomeDoVinculo(nota));
    }

    return [...itens].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));
  });

  itemToStringFiltro = (value: number | null | undefined) =>
    this.opcoesDoTipo().find((o) => o.id === value)?.nome || 'Todos';

contagem = computed(() => {
  const total: Record<TipoVinculo, number> = { NEGOCIO: 0, SAFRA: 0, PROJETO: 0 };
  for (const nota of this.notas()) {
    const tipo: TipoVinculo | null = tipoDaNota(nota);
    if (tipo) total[tipo]++;
  }
  return total;
});

contagemDe(tipo: TipoVinculo): number {
  return this.contagem()[tipo];
}

  notasFiltradas = computed(() => {
    const termo = normalizarTexto(this.busca().trim());
    const tipo = this.tipoFiltro();
    const vinculo = this.vinculoFiltro();

    return this.notas().filter((nota) => {
      if (termo && !normalizarTexto(nota.titulo).includes(termo)) return false;
      if (tipo) {
        if (tipoDaNota(nota) !== tipo) return false;
        if (vinculo != null && idDoVinculo(nota) !== vinculo) return false;
      }
      return true;
    });
  });

  temFiltroAtivo = computed(() => !!this.busca().trim() || this.tipoFiltro() !== null);

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregar();
    });
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.notaService.buscarPorFazenda(fazendaId).subscribe({
      next: (notas) => {
        this.notas.set(notas);
        this.sincronizarFiltro();
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar as notas');
      },
    });
  }

  // Se o item filtrado deixou de existir (ex.: a última nota dele foi excluída), volta para "todos"
  private sincronizarFiltro(): void {
    const vinculo = this.vinculoFiltro();
    if (vinculo != null && !this.opcoesDoTipo().some((o) => o.id === vinculo)) {
      this.vinculoFiltro.set(null);
    }
  }

  aoDigitarBusca(event: Event): void {
    this.busca.set((event.target as HTMLInputElement).value);
  }

  selecionarTipo(tipo: TipoVinculo | null): void {
    this.tipoFiltro.set(tipo);
    this.vinculoFiltro.set(null);
  }

  aoMudarVinculoFiltro(id: number | null | undefined): void {
    this.vinculoFiltro.set(id ?? null);
  }

  limparFiltros(): void {
    this.busca.set('');
    this.selecionarTipo(null);
  }

  configDaNota(nota: INota) {
    const tipo = tipoDaNota(nota);
    return this.tipos.find((t) => t.valor === tipo) ?? null;
  }

  nomeVinculo(nota: INota): string {
    return nomeDoVinculo(nota);
  }

  partesTitulo(titulo: string): ParteTitulo[] {
    const termo = normalizarTexto(this.busca().trim());
    const normalizado = normalizarTexto(titulo);
    if (!termo || normalizado.length !== titulo.length) return [{ texto: titulo, destaque: false }];

    const partes: ParteTitulo[] = [];
    let cursor = 0;
    while (true) {
      const indice = normalizado.indexOf(termo, cursor);
      if (indice === -1) break;
      if (indice > cursor) partes.push({ texto: titulo.slice(cursor, indice), destaque: false });
      partes.push({ texto: titulo.slice(indice, indice + termo.length), destaque: true });
      cursor = indice + termo.length;
    }
    if (cursor < titulo.length) partes.push({ texto: titulo.slice(cursor), destaque: false });
    return partes;
  }

  abrirDialogo(nota?: INota): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovaNota, {
      context: { fazendaId, nota },
      contentClass: 'sm:!max-w-[640px] sm:!min-w-[480px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  aoTeclarNoCard(event: Event, nota: INota): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    this.abrirDialogo(nota);
  }

  excluirNota(nota: INota, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: 'Excluir Nota',
        mensagem: `Deseja realmente excluir a nota "${nota.titulo}"?`,
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[500px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (!confirmado) return;

      this.notaService.excluir(nota.id).subscribe({
        next: () => {
          this.notas.update((lista) => lista.filter((n) => n.id !== nota.id));
          this.sincronizarFiltro();
          this.toastService.showSuccess('Sucesso', 'Nota excluída');
        },
        error: () => this.toastService.showError('Erro', 'Não foi possível excluir a nota'),
      });
    });
  }
}