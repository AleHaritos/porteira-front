export interface ICustoFixoTalhao {
  id: number;
  talhaoId: number;
  descricao: string;
  valor: number;
}

export interface CustoFixoTalhaoRequest {
  talhaoId: number;
  descricao: string;
  valor: number;
}