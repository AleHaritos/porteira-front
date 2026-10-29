export type StatusTalhao =
  | 'PREPARO_DO_SOLO'
  | 'PLANTIO'
  | 'ADUBACAO'
  | 'PULVERIZACAO'
  | 'IRRIGACAO'
  | 'COLHEITA'
  | 'OUTRO';

export type TalhaoUpdateRequest = Omit<TalhaoRequest, 'safraId'>;

export interface TalhaoRequest {
  nome: string;
  areaHectares: number;
  localizacao?: string;
  observacao?: string;
  statusTalhao: StatusTalhao;
  safraId: number;
}

export interface ITalhao {
  id: number;
  nome: string;
  areaHectares: number;
  localizacao: string | null;
  observacao: string | null;
  statusTalhao: StatusTalhao;
  safraId: number;
  safraNome: string;
  ativo: boolean;
}