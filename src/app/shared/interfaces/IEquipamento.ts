export interface IEquipamento {
  id: number;
  nome: string;
  dataCompra: string;
  valorCompra: number;
  observacao?: string;
  ativo: boolean;
}

export interface EquipamentoRequest {
  nome: string;
  dataCompra: string;
  valorCompra: number;
  observacao?: string;
  fazendaId: number;
}