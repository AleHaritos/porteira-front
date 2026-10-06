export type StatusSafra = 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'COLHEITA' | 'ENCERRADO';

export interface ISafra {
    id: number,
    nome: string,
    cultura: string,
    anoAgricola: string,
    areaTotal: number,
    observacoes: string | null,
    fazendaId: number,
    fazendaNome: string,
    status: StatusSafra
}

export interface ISafraRequest {
    nome: string,
    cultura: string,
    anoAgricola: string,
    status: StatusSafra,
    areaTotal: number,
    observacoes: string | null,
    fazendaId: number,
}