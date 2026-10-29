export type StatusProjeto = 'PLANEJAMENTO' | 'ANDAMENTO' | 'FINALIZADO';

export interface IProjeto {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  status: StatusProjeto;
  observacoes: string | null;
  fazendaId: number;
  fazendaNome: string;
}

export interface ProjetoRequest {
  nome: string;
  descricao?: string;
  observacoes?: string;
  fazendaId: number;
}

export interface ProjetoUpdateRequest {
  nome: string;
  descricao?: string;
  observacoes?: string;
  status: StatusProjeto;
}