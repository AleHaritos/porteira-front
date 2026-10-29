export interface IColheitaTalhao {
  id: number;
  talhaoId: number;
  descricao: string | null;
  data: string | null;
  quantidadeColhida: number;
  valorUnitario: number;
}

export interface ColheitaTalhaoRequest {
  talhaoId: number;
  descricao?: string;
  data?: string;
  quantidadeColhida: number;
  valorUnitario: number;
}

export interface ColheitaTalhaoUpdateRequest {
  descricao?: string;
  data?: string;
  quantidadeColhida: number;
  valorUnitario: number;
}