export type TipoManutencao = 'PREVENTIVA' | 'CORRETIVA' | 'REVISAO' | 'TROCA_OLEO' | 'PNEUS' | 'OUTRA';

export interface IManutencao {
  id: number;
  veiculoId: number;
  veiculoNome: string;
  tipo: TipoManutencao;
  descricao?: string;
  data: string;
  valor: number;
  kmAtual?: number | null;
  observacao?: string;
  vinculoNome?: string | null;
}

export interface ManutencaoRequest {
  veiculoId: number;
  tipo: TipoManutencao;
  descricao?: string;
  data: string;
  valor: number;
  kmAtual?: number | null;
  observacao?: string;
  fazendaId: number;
  negocioId?: number;
  safraId?: number;
}