export type TipoCuidado = 'VACINACAO' | 'ALIMENTACAO';
export type TipoVinculoCuidado = 'ANIMAL' | 'LOTE' | 'PIQUETE';

export interface ICuidadoAnimal {
  id: number;
  tipo: TipoCuidado;
  vinculoTipo: TipoVinculoCuidado;
  descricao: string | null;
  custo: number;
  data: string;
  animalId: number | null;
  animalTipo: string | null;
  animalDescricao: string | null;
  loteId: number | null;
  loteNome: string | null;
  piqueteId: number;
  piqueteNome: string;
  negocioId: number | null;
  negocioNome: string | null;
  safraId: number | null;
  safraNome: string | null;
}

export interface CuidadoAnimalRequest {
  tipo: TipoCuidado;
  vinculoTipo: TipoVinculoCuidado;
  descricao?: string;
  custo: number;
  data: string;
  animalId?: number | null;
  loteId?: number | null;
  piqueteId: number;
  fazendaId: number;
  negocioId?: number | null;
  safraId?: number | null;
}