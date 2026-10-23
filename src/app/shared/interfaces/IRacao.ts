export interface IRacaoIngrediente {
  ingredienteId: number;
  ingredienteNome: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

export interface IRacao {
  id: number;
  nome: string;
  ativo: boolean;
  custoTotal: number;
  ingredientes: IRacaoIngrediente[];
}

export interface RacaoRequestItem {
  ingredienteId: number;
  quantidade: number;
}

export interface RacaoRequest {
  nome: string;
  fazendaId: number;
  ingredientes: RacaoRequestItem[];
}