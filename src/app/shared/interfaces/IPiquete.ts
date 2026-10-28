export type StatusPiquete = 'CRIA' | 'RECRIA' | 'ENGORDA';

export interface IPiquete {
  id: number;
  nome: string;
  areaHectares: number;
  status: StatusPiquete;
  ativo: boolean;
  quantidadeAnimais: number;
}

export interface PiqueteRequest {
  nome: string;
  areaHectares: number;
  status: StatusPiquete;
  fazendaId: number;
}