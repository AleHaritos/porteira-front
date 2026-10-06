export type StatusSafra = 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'COLHEITA' | 'ENCERRADO';

export interface ISafra {
    id: number,
    nome: string,
    cultura: string,
    anoAgricola: string,
    dataInicio: string;
    previsaoFim: string | null;
    areaTotal: number,
    observacoes: string,
    fazendaId: number,
    fazendaNome: string,
    status: StatusSafra
}

export interface ISafraRequest {
    nome: string,
    cultura: string,
    anoAgricola: string,
    dataInicio: string;
    previsaoFim: string | null;
    status: StatusSafra,
    areaTotal: number,
    observacoes: string,
    fazendaId: number,
}