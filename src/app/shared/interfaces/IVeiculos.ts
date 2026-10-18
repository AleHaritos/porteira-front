export type TipoVeiculo = 'CAMINHAO' | 'TRATOR' | 'CARRO' | 'MOTO';

export interface IVeiculo {
  id: number;
  nome: string;
  placa: string;
  dataCompra: string;
  observacao?: string;
  tipo: TipoVeiculo;
  ativo: boolean;
}

export interface VeiculoRequest {
  nome: string;
  placa: string;
  dataCompra: string;
  observacao?: string;
  tipo: TipoVeiculo;
  fazendaId: number;
}