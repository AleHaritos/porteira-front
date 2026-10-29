export interface IEventoCalendario {
  id: number;
  titulo: string;
  descricao?: string;
  data: string;
  horaInicio?: string | null;
  horaFim?: string | null;
}

export interface EventoCalendarioRequest {
  fazendaId: number;
  titulo: string;
  descricao?: string;
  data: string;
  horaInicio?: string | null;
  horaFim?: string | null;
}