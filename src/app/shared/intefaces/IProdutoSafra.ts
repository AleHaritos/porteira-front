export interface ProdutoSafraRequest {
  nome: string;
  custo: number;
  safraId: number;
}

export interface IProdutoSafra {
  id: number;
  nome: string;
  custo: number;
  safraId: number;
  safraNome: string;
}