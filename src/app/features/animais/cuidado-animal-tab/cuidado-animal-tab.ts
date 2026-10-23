import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { AnimalService } from '../../../core/services/animais/animal-service';
import { CuidadoAnimalService } from '../../../core/services/animais/cuidado-animal-service';
import { LoteService } from '../../../core/services/animais/lote-service';
import { ToastService } from '../../../core/services/toast-service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { IAnimal } from '../../../shared/interfaces/IAnimal';
import { ICuidadoAnimal, TipoCuidado } from '../../../shared/interfaces/ICuidadoAnimal';
import { ILote } from '../../../shared/interfaces/ILote';
import { NovoCuidadoAnimal } from '../novo-cuidado-animal/novo-cuidado-animal';

@Component({
  selector: 'app-cuidado-animal-tab',
  imports: [CommonModule, ReactiveFormsModule, HlmTableImports, HlmButtonImports, HlmDatePickerImports, HlmLabelImports, HlmPaginationImports, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideTrash2 })],
  styleUrl: './cuidado-animal-tab.css',
  templateUrl: './cuidado-animal-tab.html',
})
export class CuidadoAnimalTab implements OnInit {
  tipo = input.required<TipoCuidado>();
  fazendaId = input.required<number>();
  piqueteId = input.required<number>();

  private cuidadoService = inject(CuidadoAnimalService);
  private animalService = inject(AnimalService);
  private loteService = inject(LoteService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  registros = signal<ICuidadoAnimal[]>([]);
  animaisDoPiquete = signal<IAnimal[]>([]);
  lotesDoPiquete = signal<ILote[]>([]);
  carregando = signal(false);

  maxDate = new Date();
  dataInicioControl = new FormControl<Date | null>(this.primeiroDiaDoMes());
  dataFimControl = new FormControl<Date | null>(new Date());

  paginaAtual = signal(0);
  totalPaginas = signal(0);

  paginasVisiveis = computed(() => {
    const atual = this.paginaAtual();
    const total = this.totalPaginas();
    const inicio = Math.max(0, atual - 1);
    const fim = Math.min(total - 1, atual + 1);
    const paginas: number[] = [];
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
  });

  get titulo(): string {
    return this.tipo() === 'VACINACAO' ? 'Vacinação' : 'Alimentação';
  }

  private primeiroDiaDoMes(): Date {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  ngOnInit(): void {
    this.carregar();
    this.carregarAnimaisDoPiquete();

    this.dataInicioControl.valueChanges.subscribe(() => this.onFiltroDataChange());
    this.dataFimControl.valueChanges.subscribe(() => this.onFiltroDataChange());
  }

  onFiltroDataChange(): void {
    this.paginaAtual.set(0);
    this.carregar();
  }

  carregar(): void {
    const dataInicio = this.dataInicioControl.value;
    const dataFim = this.dataFimControl.value;
    if (!dataInicio || !dataFim) return;

    this.carregando.set(true);
    this.cuidadoService
      .listarPorPiquete(
        this.piqueteId(),
        this.tipo(),
        dataInicio.toISOString().split('T')[0],
        dataFim.toISOString().split('T')[0],
        this.paginaAtual(),
        10,
      )
      .subscribe({
        next: (res) => {
          this.registros.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', `Não foi possível carregar os registros de ${this.titulo.toLowerCase()}`);
        },
      });
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina > this.totalPaginas() - 1) return;
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  carregarAnimaisDoPiquete(): void {
    this.animalService.listarPorFazenda(this.fazendaId(), this.piqueteId(), null, null, 0, 1000).subscribe({
      next: (res) => {
        this.animaisDoPiquete.set(res.content);

        this.loteService.listarPorFazenda(this.fazendaId()).subscribe({
          next: (lotes) => {
            const idsLotesComAnimalAqui = new Set(
              res.content.map((a) => a.loteId).filter((id): id is number => id != null),
            );
            this.lotesDoPiquete.set(lotes.filter((l) => idsLotesComAnimalAqui.has(l.id)));
          },
        });
      },
    });
  }

  vinculoLabel(registro: ICuidadoAnimal): string {
    if (registro.vinculoTipo === 'PIQUETE') return 'Todo o piquete';
    if (registro.vinculoTipo === 'LOTE') return `Lote: ${registro.loteNome}`;
    return `Animal: ${registro.animalDescricao || '#' + registro.animalId}`;
  }

  abrirNovoRegistro(): void {
    const dialogRef = this.dialogService.open(NovoCuidadoAnimal, {
      context: {
        tipo: this.tipo(),
        fazendaId: this.fazendaId(),
        piqueteId: this.piqueteId(),
        animais: this.animaisDoPiquete(),
        lotes: this.lotesDoPiquete(),
      },
      contentClass: 'sm:!max-w-[740px], sm:!min-w-[620px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  excluir(registro: ICuidadoAnimal): void {
    const dialogRef = this.dialogService.open(ConfirmDialog, {
      context: {
        titulo: `Excluir registro de ${this.titulo.toLowerCase()}`,
        mensagem: 'Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.',
        textoConfirmar: 'Excluir',
      },
      contentClass: 'sm:!max-w-[520px]',
    });

    dialogRef.closed$.subscribe((confirmado) => {
      if (confirmado) {
        this.cuidadoService.excluir(registro.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Sucesso', 'Registro excluído com sucesso!');
            this.carregar();
          },
          error: () => this.toastService.showError('Erro', 'Não foi possível excluir o registro'),
        });
      }
    });
  }
}