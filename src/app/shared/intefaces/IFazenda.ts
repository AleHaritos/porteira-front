import { IUsuarioDTO } from "./IUsuario"

export interface IFazenda {
    id: number,
    nome: string,
    hectares: number,
    localizacao: string,
    dono: IUsuarioDTO,
    colaboradores: IUsuarioDTO[]
}


export interface IFazendaRequest {
    nome: string,
    hectares: number,
    localizacao: string
}