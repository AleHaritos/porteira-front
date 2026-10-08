export type TipoManejo = 'PREPARO_DO_SOLO' | 'PLANTIO' | 'ADUBACAO' | 'PULVERIZACAO' | 'IRRIGACAO' | 'COLHEITA' | 'OUTROS';

export interface IItemManejo {
  id: number;
  produtoSafraId: number;
  produtoSafraNome: string;
  quantidade: number;
  custoUnitario: number;
  custoTotal: number;
}

export interface IItemManejoRequest {
  produtoSafraId: number;
  quantidade: number;
}

export interface IManejo {
  id: number;
  tipo: TipoManejo;
  data: string;
  descricao: string | null;
  observacoes: string | null;
  talhaoId: number;
  talhaoNome: string;
  itens: IItemManejo[];
  custoTotal: number;
}

export interface ManejoRequest {
  tipo: TipoManejo;
  data: string;
  descricao?: string;
  observacoes?: string;
  talhaoId: number;
  itens: IItemManejoRequest[];
}

export type ManejoUpdateRequest = Omit<ManejoRequest, 'talhaoId'>;