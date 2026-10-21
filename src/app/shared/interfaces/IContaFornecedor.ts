import { StatusPagamentoManutencao } from './IManutencao';

export interface IContaFornecedor {
  id: number;
  fornecedorId: number;
  fornecedorNome: string;
  descricao: string;
  data: string;
  valor: number;
  vinculoNome?: string;
  statusPagamento: StatusPagamentoManutencao;
  dataBaixa?: string;
}

export interface ContaFornecedorRequest {
  fornecedorId: number;
  fazendaId: number;
  descricao: string;
  data: string;
  valor: number;
  negocioId: number | null;
  safraId: number | null;
}