export interface IPiquete {
  id: number;
  nome: string;
  areaHectares: number;
  ativo: boolean;
  quantidadeAnimais: number;
}

export interface PiqueteRequest {
  nome: string;
  areaHectares: number;
  fazendaId: number;
}