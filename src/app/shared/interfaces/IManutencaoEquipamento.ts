import { TipoManutencao, FormaPagamentoManutencao, StatusPagamentoManutencao } from './IManutencao';

export interface IManutencaoEquipamento {
  id: number;
  equipamentoId: number;
  equipamentoNome: string;
  tipo: TipoManutencao;
  descricao?: string;
  data: string;
  valor: number;
  observacao?: string;
  formaPagamento: FormaPagamentoManutencao;
  fornecedorNome?: string;
  vinculoNome?: string;
  statusPagamento: StatusPagamentoManutencao;
  dataBaixa?: string;
  origem?: 'SIMPLES' | 'PARCELA';
  numeroParcela?: number;
  totalParcelas?: number;
}

export interface ManutencaoEquipamentoRequest {
  equipamentoId: number;
  tipo: TipoManutencao;
  descricao?: string;
  data: string;
  valor: number;
  observacao?: string;
  fazendaId: number;
  negocioId?: number;
  safraId?: number;
  projetoId?: number;
  formaPagamento: FormaPagamentoManutencao;
  fornecedorId?: number;
}