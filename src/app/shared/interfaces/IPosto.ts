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

export interface PostoPagamentoRequest {
  valor: number;
  data: string;
  negocioId?: number;
  safraId?: number;
  observacao?: string;
}