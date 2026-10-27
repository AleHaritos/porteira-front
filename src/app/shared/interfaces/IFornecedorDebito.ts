export interface IFornecedorDebito {
  id: number;
  origem: 'VEICULO' | 'EQUIPAMENTO' | 'CONTA' | 'MANUTENCAO_PARCELADA';
  nomeAtivo: string;
  tipo: string;
  descricao?: string;
  data: string;
  valor: number;
  statusPagamento: 'PENDENTE' | 'BAIXADO';
  dataBaixa?: string;
}

export interface PageFornecedorDebito {
  content: IFornecedorDebito[];
  totalPages: number;
  totalElements: number;
  number: number;
}