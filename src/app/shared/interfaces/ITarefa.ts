export type StatusTarefa = 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDO';
export type PrioridadeTarefa = 'BAIXA' | 'MEDIA' | 'ALTA';

export interface ISubTarefa {
  id: number;
  titulo: string;
  concluida: boolean;
}

export interface ITarefa {
  id: number;
  titulo: string;
  descricao?: string;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  prazo?: string | null;
  ordem: number;
  subtarefas: ISubTarefa[];
}

export interface TarefaRequest {
  fazendaId: number;
  titulo: string;
  descricao?: string;
  prioridade: PrioridadeTarefa;
  prazo?: string | null;
  subtarefas?: string[];
}

export interface TarefaStatusRequest {
  status: StatusTarefa;
  ordem: number;
}

export interface SubTarefaRequest {
  titulo: string;
}