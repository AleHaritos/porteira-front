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
  negocioId: number | null;
  negocioNome: string | null;
  safraId: number | null;
  safraNome: string | null;
  projetoId: number | null;
  projetoNome: string | null;
}

export interface TarefaRequest {
  fazendaId: number;
  titulo: string;
  descricao?: string;
  prioridade: PrioridadeTarefa;
  prazo?: string | null;
  subtarefas?: string[];
  negocioId?: number | null;
  safraId?: number | null;
  projetoId?: number | null;
}

export interface TarefaStatusRequest {
  status: StatusTarefa;
  ordem: number;
}

export interface SubTarefaRequest {
  titulo: string;
}