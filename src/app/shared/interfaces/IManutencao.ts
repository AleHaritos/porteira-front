export type TipoManutencao = 'PREVENTIVA' | 'CORRETIVA' | 'REVISAO' | 'TROCA_OLEO' | 'PNEUS' | 'OUTRA';
export type FormaPagamentoManutencao = 'A_VISTA' | 'FORNECEDOR_CREDENCIADO';

export interface IManutencao {
  id: number;
  veiculoId: number;
  veiculoNome: string;
  tipo: TipoManutencao;
  descricao?: string;
  data: string;
  valor: number;
  kmAtual?: number;
  observacao?: string;
  formaPagamento: FormaPagamentoManutencao;
  fornecedorNome?: string;
  vinculoNome?: string;
}

export interface ManutencaoRequest {
  veiculoId: number;
  tipo: TipoManutencao;
  descricao?: string;
  data: string;
  valor: number;
  kmAtual?: number;
  observacao?: string;
  fazendaId: number;
  negocioId?: number;
  safraId?: number;
  formaPagamento: FormaPagamentoManutencao;
  fornecedorId?: number;
}
