export interface IFornecedor {
  id: number;
  nome: string;
  especialidade?: string;
  saldoDevedor: number;
  observacao?: string;
  ativo: boolean;
}

export interface FornecedorRequest {
  nome: string;
  especialidade?: string;
  observacao?: string;
  fazendaId: number;
}