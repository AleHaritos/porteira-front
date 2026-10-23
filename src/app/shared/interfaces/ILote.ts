export interface ILote {
  id: number;
  nome: string;
  observacoes: string | null;
  ativo: boolean;
  quantidadeAnimais: number;
}

export interface LoteRequest {
  nome: string;
  observacoes?: string;
  fazendaId: number;
}