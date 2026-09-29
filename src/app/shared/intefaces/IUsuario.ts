export interface Usuario {
  id: number;
  nome: string;
  numero: string;
  admin: boolean;
}

export interface UsuarioRequest {
  nome: string;
  numero: string;
}

export interface SenhaRequest {
  numero: string,
  senha: string
}

export interface IUsuarioDTO {
  id: number;
  nome: string;
  numero: string;
}
