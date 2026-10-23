export interface IIngrediente {
  id: number;
  nome: string;
  valorUnitario: number;
  unidade: string | null;
  ativo: boolean;
}

export interface IngredienteRequest {
  nome: string;
  valorUnitario: number;
  unidade: string | null;
  fazendaId: number;
}