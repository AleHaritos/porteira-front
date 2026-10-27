import { TipoCombustivel } from './IAbastecimento';

export interface IEstoqueCombustivel {
  id: number;
  tipoCombustivel: TipoCombustivel;
  quantidadeLitros: number;
  ultimoValorPorLitro: number | null;
}

export interface ReabastecimentoEstoqueRequest {
  fazendaId: number;
  tipoCombustivel: TipoCombustivel;
  litros: number;
  valorPorLitro: number;
  data: string;
  negocioId?: number;
  safraId?: number;
  observacao?: string;
}

export interface IReabastecimentoHistorico {
  id: number;
  tipoCombustivel: TipoCombustivel;
  data: string;
  litros: number;
  valorPorLitro: number;
  observacao: string | null;
}