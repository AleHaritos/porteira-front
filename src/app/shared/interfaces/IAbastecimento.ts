export type TipoCombustivel = 'DIESEL' | 'GASOLINA' | 'ETANOL';
export type LocalAbastecimento = 'ESTOQUE_FAZENDA' | 'POSTO_CREDENCIADO' | 'POSTO_CASUAL';

export interface IAbastecimento {
  id: number;
  veiculoId: number;
  veiculoNome: string;
  data: string;
  litros: number;
  valorPorLitro: number | null;
  valorTotal: number | null;
  tipoCombustivel: TipoCombustivel;
  localAbastecimento: LocalAbastecimento;
  postoNome?: string | null;
  kmAtual?: number | null;
  observacao?: string;
  vinculoNome?: string | null;
}

export interface AbastecimentoRequest {
  veiculoId: number;
  data: string;
  litros: number;
  valorPorLitro?: number | null;
  tipoCombustivel: TipoCombustivel;
  localAbastecimento: LocalAbastecimento;
  postoId?: number | null;
  kmAtual?: number | null;
  observacao?: string;
  fazendaId: number;
  negocioId?: number;
  safraId?: number;
}