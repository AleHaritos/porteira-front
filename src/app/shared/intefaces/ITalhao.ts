export interface TalhaoRequest {
  nome: string;
  areaHectares: number;
  localizacao?: string;
  observacao?: string;
  safraId: number;
}

export interface ITalhao {
  id: number;
  nome: string;
  areaHectares: number;
  localizacao: string | null;
  observacao: string | null;
  safraId: number;
  safraNome: string;
  ativo: boolean;
}