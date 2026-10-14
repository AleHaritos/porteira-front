export interface ILote {
  id: number;
  nome: string;
  quantidade: number;
  observacoes?: string;
  ativo: boolean;
}

export interface LoteRequest {
  nome: string;
  quantidade: number;
  observacoes?: string;
  fazendaId: number;
}