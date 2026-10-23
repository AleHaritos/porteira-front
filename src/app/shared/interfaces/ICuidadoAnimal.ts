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
  racaoId: number | null;
  racaoNome: string | null;
  quantidadeRacao: number | null;
}

export interface CuidadoAnimalRequest {
  tipo: TipoCuidado;
  vinculoTipo: TipoVinculoCuidado;
  descricao?: string;
  custo: number;
  data: string;
  animalId?: number;
  loteId?: number;
  piqueteId: number;
  fazendaId: number;
  racaoId?: number;
  quantidadeRacao?: number;
}

export interface PaginaCuidadoAnimal {
  content: ICuidadoAnimal[];
  totalPages: number;
  totalElements: number;
  number: number;
}