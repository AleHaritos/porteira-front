import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarDays, lucideChevronLeft, lucideChevronRight, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { EventoCalendarioService } from '../../core/services/calendario/evento-calendario-service';
import { ToastService } from '../../core/services/toast-service';
import { IEventoCalendario } from '../../shared/interfaces/IEventoCalendario';
import { NovoEvento } from './novo-evento/novo-evento';

interface DiaCalendario {
  data: Date;
  numero: number;
  noMesAtual: boolean;
  hoje: boolean;
  eventos: IEventoCalendario[];
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

@Component({
  selector: 'app-calendario',
  imports: [CommonModule, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideCalendarDays, lucideChevronLeft, lucideChevronRight, lucidePlus, lucideTrash2 })],
  styleUrl: './calendario.css',
  templateUrl: './calendario.html',
})
export class Calendario implements OnInit {
  private route = inject(ActivatedRoute);
  private eventoCalendarioService = inject(EventoCalendarioService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  readonly diasSemana = DIAS_SEMANA;

  fazendaId = signal<number | null>(null);
  mesReferencia = signal<Date>(this.primeiroDiaDoMes(new Date()));
  eventos = signal<IEventoCalendario[]>([]);
  carregando = signal(false);

  tituloMes = computed(() => {
    const ref = this.mesReferencia();
    return `${MESES[ref.getMonth()]} ${ref.getFullYear()}`;
  });

  private eventosPorDia = computed(() => {
    const mapa = new Map<string, IEventoCalendario[]>();
    for (const evento of this.eventos()) {
      const lista = mapa.get(evento.data) ?? [];
      lista.push(evento);
      mapa.set(evento.data, lista);
    }
    return mapa;
  });

  dias = computed<DiaCalendario[]>(() => {
    const ref = this.mesReferencia();
    const ano = ref.getFullYear();
    const mes = ref.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const inicioGrade = new Date(ano, mes, 1 - primeiroDia.getDay());
    const hoje = new Date();
    const eventosPorDia = this.eventosPorDia();

    const dias: DiaCalendario[] = [];
    for (let i = 0; i < 42; i++) {
      const data = new Date(inicioGrade.getFullYear(), inicioGrade.getMonth(), inicioGrade.getDate() + i);
      const chave = this.formatarDataIso(data);
      dias.push({
        data,
        numero: data.getDate(),
        noMesAtual: data.getMonth() === mes,
        hoje: chave === this.formatarDataIso(hoje),
        eventos: eventosPorDia.get(chave) ?? [],
      });
    }
    return dias;
  });

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregar();
    });
  }

  private primeiroDiaDoMes(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), 1);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const ref = this.mesReferencia();
    const primeiroDia = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const inicioGrade = new Date(ref.getFullYear(), ref.getMonth(), 1 - primeiroDia.getDay());
    const fimGrade = new Date(inicioGrade.getFullYear(), inicioGrade.getMonth(), inicioGrade.getDate() + 41);

    this.carregando.set(true);
    this.eventoCalendarioService
      .buscarPorFazendaEPeriodo(fazendaId, this.formatarDataIso(inicioGrade), this.formatarDataIso(fimGrade))
      .subscribe({
        next: (eventos) => {
          this.eventos.set(eventos);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.showError('Erro', 'Não foi possível carregar os eventos');
        },
      });
  }

  mesAnterior(): void {
    const ref = this.mesReferencia();
    this.mesReferencia.set(new Date(ref.getFullYear(), ref.getMonth() - 1, 1));
    this.carregar();
  }

  mesProximo(): void {
    const ref = this.mesReferencia();
    this.mesReferencia.set(new Date(ref.getFullYear(), ref.getMonth() + 1, 1));
    this.carregar();
  }

  irParaHoje(): void {
    this.mesReferencia.set(this.primeiroDiaDoMes(new Date()));
    this.carregar();
  }

  abrirNovoEvento(data?: Date): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoEvento, {
      context: { fazendaId, dataInicial: data ?? new Date() },
      contentClass: 'sm:!max-w-[700px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((criado) => {
      if (criado) this.carregar();
    });
  }

  editarEvento(evento: IEventoCalendario, domEvent: Event): void {
    domEvent.stopPropagation();
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    const dialogRef = this.dialogService.open(NovoEvento, {
      context: { fazendaId, evento },
      contentClass: 'sm:!max-w-[700px], sm:!min-w-[500px]',
    });

    dialogRef.closed$.subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  excluirEvento(evento: IEventoCalendario, domEvent: Event): void {
    domEvent.stopPropagation();
    if (!confirm(`Excluir o evento "${evento.titulo}"?`)) return;

    this.eventoCalendarioService.excluir(evento.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Sucesso', 'Evento excluído');
        this.carregar();
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível excluir o evento'),
    });
  }

  formatarHorario(evento: IEventoCalendario): string {
    if (!evento.horaInicio) return '';
    return evento.horaFim ? `${evento.horaInicio} - ${evento.horaFim}` : evento.horaInicio;
  }
}