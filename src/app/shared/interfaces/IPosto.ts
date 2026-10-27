export interface IPosto {
  id: number;
  nome: string;
  saldoDevedor: number;
  ativo: boolean;
  observacao?: string;
}

export interface PostoRequest {
  nome: string;
  fazendaId: number;
  observacao?: string;
}