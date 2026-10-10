import { TipoTransacao } from './ITransacao';

export type StatusParcela = 'PENDENTE' | 'BAIXADO';

export interface IParcelaContaPendente {
  id: number;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: string;
  status: StatusParcela;
  dataBaixa: string | null;
  tipo: TipoTransacao;
  contaPendenteId: number;
  descricao: string | null;
  negocioNome: string | null;
  safraNome: string | null;
}

export interface ContaPendenteRequest {
  descricao?: string;
  valoresParcelas: number[];
  primeiraDataVencimento: string;
  tipo: TipoTransacao;
  fazendaId: number;
  negocioId?: number;
  safraId?: number;
  observacao?: string;
}

export interface IContaPendente {
  id: number;
  descricao: string | null;
  valorTotal: number;
  numeroParcelas: number;
  tipo: TipoTransacao;
  fazendaId: number;
  negocioId: number | null;
  negocioNome: string | null;
  safraId: number | null;
  safraNome: string | null;
  observacao: string | null;
}