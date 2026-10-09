export interface INegocio {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  observacoes: string | null;
  fazendaId: number;
  fazendaNome: string;
}

export interface NegocioRequest {
  nome: string;
  descricao?: string;
  observacoes?: string;
  fazendaId: number;
}

export type NegocioUpdateRequest = Omit<NegocioRequest, 'fazendaId'>;