export type TipoTransacao = 'RECEITA' | 'GASTO';

export interface ITransacao {
  id: number;
  data: string;
  valor: number;
  tipo: TipoTransacao;
  descricao: string | null;
  observacao: string | null;
  ativo: boolean;
  fazendaId: number;
  fazendaNome: string;
  negocioId: number | null;
  negocioNome: string | null;
  safraId: number | null;
  safraNome: string | null;
}

export interface TransacaoRequest {
  data: string;
  valor: number;
  tipo: TipoTransacao;
  descricao?: string;
  observacao?: string;
  fazendaId: number;
  negocioId?: number;
  safraId?: number;
}

export type TransacaoUpdateRequest = Omit<TransacaoRequest, 'fazendaId'>;