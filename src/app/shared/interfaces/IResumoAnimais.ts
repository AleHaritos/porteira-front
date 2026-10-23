export interface IOperacaoVendaResumo {
  id: number;
  data: string;
  descricao: string | null;
  valorVenda: number;
  custoTotal: number;
  lucro: number;
  quantidadeAnimais: number;
}

export interface ICuidadoAnimalResumo {
  id: number;
  tipo: 'VACINACAO' | 'ALIMENTACAO';
  data: string;
  descricao: string | null;
  custo: number;
  piqueteNome: string | null;
  destino: string;
}

export interface IResumoAnimais {
  gastoAlimentacao: number;
  gastoVacinacao: number;
  gastoTotal: number;
  receitaVendas: number;
  custoVendas: number;
  lucroVendas: number;
  operacoesVenda: IOperacaoVendaResumo[];
  cuidados: ICuidadoAnimalResumo[];
}