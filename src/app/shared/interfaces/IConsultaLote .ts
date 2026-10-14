export type TipoConsulta = 'VACINACAO' | 'CONSULTA_VETERINARIA' | 'EXAME' | 'TRATAMENTO' | 'OUTRA';

export interface IConsultaLote {
  id: number;
  loteId: number;
  loteNome: string;
  tipo: TipoConsulta;
  data: string;
  quantidadeAnimais: number;
  custo: number;
  descricao?: string;
  observacao?: string;
  negocioNome?: string;
  safraNome?: string;
}

export interface ConsultaLoteRequest {
  loteId: number;
  tipo: TipoConsulta;
  data: string;
  quantidadeAnimais: number;
  custo: number;
  descricao?: string;
  observacao?: string;
  fazendaId: number;
  negocioId?: number;
  safraId?: number;
}