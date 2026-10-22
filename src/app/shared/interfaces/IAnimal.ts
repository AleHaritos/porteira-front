export type TipoAnimal = 'GADO' | 'BEZERRO' | 'NOVILHA' | 'CAVALO' | 'PORCO' | 'GALINHA' | 'OUTRO';

export interface IAnimal {
  id: number;
  tipo: TipoAnimal;
  loteId: number | null;
  loteNome: string | null;
  piqueteId: number;
  piqueteNome: string;
  descricao: string | null;
}

export interface AnimalRequest {
  tipo: TipoAnimal;
  loteId?: number | null;
  piqueteId: number;
  fazendaId: number;
  descricao?: string | null;
}

export interface AnimalEmMassaItem {
  tipo: TipoAnimal;
  loteId?: number | null;
  descricao?: string | null;
}

export interface VendaAnimalRequest {
  animalIds: number[];
  valor: number;
  data: string;
  descricao?: string;
  fazendaId: number;
  negocioId?: number | null;
  safraId?: number | null;
}

export interface AnimalEmMassaRequest {
  fazendaId: number;
  piqueteId: number;
  animais: AnimalEmMassaItem[];
}