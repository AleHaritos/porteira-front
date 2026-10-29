export interface IProdutoEstoque {
  id: number;
  nome: string;
  valor: number;
  quantidade: number;
}

export interface ProdutoEstoqueRequest {
  fazendaId: number;
  nome: string;
}

export interface ICompraEstoque {
  id: number;
  quantidade: number;
  valorUnitario: number;
  data: string;
  observacao: string | null;
}

export interface CompraEstoqueRequest {
  quantidade: number;
  valorUnitario: number;
  data: string;
  observacao?: string;
}

export interface IUsoEstoque {
  id: number;
  quantidade: number;
  data: string;
  observacao: string | null;
}

export interface UsoEstoqueRequest {
  quantidade: number;
  data: string;
  observacao?: string;
}