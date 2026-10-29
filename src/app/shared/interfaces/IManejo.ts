export type TipoManejo = 'PREPARO_DO_SOLO' | 'PLANTIO' | 'ADUBACAO' | 'PULVERIZACAO' | 'IRRIGACAO' | 'COLHEITA' | 'OUTROS';

export interface IItemManejo {
  id: number;
  produtoSafraId: number;
  produtoNome: string;
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
  titulo: string | null;
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
  titulo?: string;
  data: string;
  descricao?: string;
  observacoes?: string;
  talhaoId: number;
  itens: IItemManejoRequest[];
}

export type ManejoUpdateRequest = Omit<ManejoRequest, 'talhaoId'>;