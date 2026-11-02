export type TipoVinculo = 'SAFRA' | 'NEGOCIO' | 'PROJETO';

export interface INota {
  id: number;
  fazendaId: number;
  titulo: string;
  corpo: string | null;
  negocioId: number | null;
  negocioNome: string | null;
  safraId: number | null;
  safraNome: string | null;
  projetoId: number | null;
  projetoNome: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface INotaRequest {
  fazendaId: number;
  titulo: string;
  corpo: string | null;
  negocioId: number | null;
  safraId: number | null;
  projetoId: number | null;
}

export interface OpcaoVinculo {
  id: number;
  nome: string;
}