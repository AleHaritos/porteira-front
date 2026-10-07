export type TipoManejo = 'PREPARO_DO_SOLO' | 'PLANTIO' | 'ADUBACAO' | 'PULVERIZACAO' | 'IRRIGACAO' | 'COLHEITA' | 'OUTROS';
export type ManejoUpdateRequest = Omit<ManejoRequest, 'talhaoId'>;

export interface IManejo {
  id: number;
  tipo: TipoManejo;
  data: string;
  descricao: string | null;
  observacoes: string | null;
  talhaoId: number;
  talhaoNome: string;
  produtoSafraId: number | null;
  produtoSafraNome: string | null;
  quantidadeProduto: number | null;
  custoTotal: number;
}

export interface ManejoRequest {
  tipo: TipoManejo;
  data: string;
  descricao?: string;
  observacoes?: string;
  talhaoId: number;
  produtoSafraId?: number;
  quantidadeProduto?: number;
}

export interface IManejoUpdateRequest {
  quantidadeProduto?: number;
  tipo: TipoManejo;
  data: string;
  descricao?: string;
  observacoes?: string;
  produtoSafraId?: number;
}

