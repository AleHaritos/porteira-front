import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarDays } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { EventoCalendarioService } from '../../../core/services/calendario/evento-calendario-service';
import { ToastService } from '../../../core/services/toast-service';
import { IEventoCalendario } from '../../../shared/interfaces/IEventoCalendario';

interface NovoEventoContext {
  fazendaId: number;
  dataInicial?: Date;
  evento?: IEventoCalendario;
}

const HORAS_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTOS_OPTIONS = ['00', '15', '30', '45'];

@Component({
  selector: 'app-novo-evento',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmDatePickerImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideCalendarDays })],
  styleUrl: './novo-evento.css',
  templateUrl: './novo-evento.html',
})
export class NovoEvento implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovoEventoContext>();
  private fb = inject(FormBuilder);
  private eventoCalendarioService = inject(EventoCalendarioService);
  private toastService = inject(ToastService);

  salvando = signal(false);
  editando = signal(!!this.context.evento);

  readonly horasOptions = HORAS_OPTIONS;
  readonly minutosOptions = MINUTOS_OPTIONS;

  horaInicioHora = signal<string | null>(null);
  horaInicioMinuto = signal<string | null>(null);
  horaFimHora = signal<string | null>(null);
  horaFimMinuto = signal<string | null>(null);

  itemToStringHora = (value: string | null | undefined) => value ?? '';
  itemToStringMinuto = (value: string | null | undefined) => value ?? '';

  form = this.fb.group({
    titulo: ['', Validators.required],
    descricao: [''],
    data: [this.context.dataInicial ?? new Date(), Validators.required],
  });

  ngOnInit(): void {
    const evento = this.context.evento;
    if (evento) {
      this.form.patchValue({
        titulo: evento.titulo,
        descricao: evento.descricao || '',
        data: this.parseData(evento.data),
      });

      const [horaInicioH, horaInicioM] = this.separarHoraMinuto(evento.horaInicio);
      this.horaInicioHora.set(horaInicioH);
      this.horaInicioMinuto.set(horaInicioM);

      const [horaFimH, horaFimM] = this.separarHoraMinuto(evento.horaFim);
      this.horaFimHora.set(horaFimH);
      this.horaFimMinuto.set(horaFimM);
    }
  }

  private separarHoraMinuto(valor: string | null | undefined): [string | null, string | null] {
    if (!valor) return [null, null];
    const [hora, minuto] = valor.split(':');
    return [hora ?? null, minuto ?? null];
  }

  private parseData(iso: string): Date {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  private formatarDataIso(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  onHoraInicioHoraChange(valor: string | null | undefined): void {
    this.horaInicioHora.set(valor ?? null);
    if (valor && !this.horaInicioMinuto()) this.horaInicioMinuto.set('00');
  }

  onHoraInicioMinutoChange(valor: string | null | undefined): void {
    this.horaInicioMinuto.set(valor ?? null);
    if (valor && !this.horaInicioHora()) this.horaInicioHora.set('00');
  }

  onHoraFimHoraChange(valor: string | null | undefined): void {
    this.horaFimHora.set(valor ?? null);
    if (valor && !this.horaFimMinuto()) this.horaFimMinuto.set('00');
  }

  onHoraFimMinutoChange(valor: string | null | undefined): void {
    this.horaFimMinuto.set(valor ?? null);
    if (valor && !this.horaFimHora()) this.horaFimHora.set('00');
  }

  private montarHorario(hora: string | null, minuto: string | null): string | null {
    if (!hora || !minuto) return null;
    return `${hora}:${minuto}`;
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Erro', 'Informe ao menos o título e a data');
      return;
    }

    const { titulo, descricao, data } = this.form.value;

    const request = {
      fazendaId: this.context.fazendaId,
      titulo: titulo!,
      descricao: descricao || undefined,
      data: this.formatarDataIso(data as Date),
      horaInicio: this.montarHorario(this.horaInicioHora(), this.horaInicioMinuto()),
      horaFim: this.montarHorario(this.horaFimHora(), this.horaFimMinuto()),
    };

    this.salvando.set(true);

    const evento = this.context.evento;
    const chamada = evento
      ? this.eventoCalendarioService.atualizar(evento.id, request)
      : this.eventoCalendarioService.salvar(request);

    chamada.subscribe({
      next: () => {
        this.toastService.showSuccess('Sucesso', evento ? 'Evento atualizado!' : 'Evento criado!');
        this.salvando.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', 'Não foi possível salvar o evento');
      },
    });
  }
}