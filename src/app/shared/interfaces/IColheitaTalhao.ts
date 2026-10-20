export interface IColheitaTalhao {
  id: number;
  talhaoId: number;
  descricao: string | null;
  quantidadeColhida: number;
  valorUnitario: number;
}

export interface ColheitaTalhaoRequest {
  talhaoId: number;
  descricao?: string;
  quantidadeColhida: number;
  valorUnitario: number;
}