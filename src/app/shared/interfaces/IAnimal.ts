export type TipoAnimal = 'GADO' | 'BEZERRO' | 'NOVILHA' | 'CAVALO' | 'PORCO' | 'GALINHA' | 'OUTRO';
export type SexoAnimal = 'MACHO' | 'FEMEA';

export interface IAnimal {
  id: number;
  tipo: TipoAnimal;
  loteId: number | null;
  loteNome: string | null;
  piqueteId: number;
  piqueteNome: string;
  descricao: string | null;
  ativo: boolean;
  sexo: SexoAnimal | null;
  dataNascimento: string | null;
  idadeMeses: number | null;
  dataCompra: string | null;
  valorCompra: number | null;
  peso: number | null;
  brinco: string | null;
  raca: string | null;
}

export interface AnimalEmMassaItem {
  tipo: TipoAnimal;
  loteId: number | null;
  descricao: string | null;
  sexo?: SexoAnimal | null;
  peso?: number | null;
  dataNascimento?: string | null;
  raca?: string | null;
  valorCompra?: number | null;
}

export interface AnimalEmMassaRequest {
  fazendaId: number;
  piqueteId: number;
  animais: AnimalEmMassaItem[];
}

export interface AnimalRequest {
  tipo: TipoAnimal;
  loteId: number | null;
  piqueteId: number;
  fazendaId: number;
  descricao: string | null;
  sexo: SexoAnimal | null;
  dataNascimento: string | null;
  dataCompra: string | null;
  valorCompra: number | null;
  peso: number | null;
  brinco: string | null;
  raca: string | null;
}

export interface TransferenciaAnimalRequest {
  animalIds: number[];
  piqueteDestinoId: number;
  fazendaId: number;
}

export interface VendaAnimalRequest {
  animalIds: number[];
  valor: number;
  data: string;
  descricao: string | null;
  fazendaId: number;
}

export interface OperacaoVendaItem {
  animalId: number | null;
  animalTipo: string | null;
  animalDescricao: string | null;
  animalBrinco: string | null;
  custoVacinacao: number;
  custoAlimentacao: number;
  valorCompra: number;
  custoTotal: number;
}

export interface PaginaOperacaoVenda {
  content: OperacaoVenda[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface OperacaoVenda {
  id: number;
  data: string;
  descricao: string | null;
  valorVenda: number;
  custoTotal: number;
  lucro: number;
  itens: OperacaoVendaItem[];
}

export interface AnimalCusto {
  custoVacinacao: number;
  custoAlimentacao: number;
  valorCompra: number;
  custoTotal: number;
}

export interface HistoricoCuidadoAnimal {
  id: number;
  tipo: 'VACINACAO' | 'ALIMENTACAO';
  origem: string;
  descricao: string | null;
  data: string;
  custoTotalEvento: number;
  custoAtribuido: number;
}