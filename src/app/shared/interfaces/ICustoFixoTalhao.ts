export interface ICustoFixoTalhao {
  id: number;
  talhaoId: number;
  descricao: string;
  valor: number;
  arrendo: boolean;
}

export interface CustoFixoTalhaoRequest {
  talhaoId: number;
  descricao: string;
  valor: number;
  arrendo: boolean;
}