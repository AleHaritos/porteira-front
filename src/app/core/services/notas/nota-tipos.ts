import { TipoVinculo, INota } from "../../../shared/interfaces/INota";


export interface ConfigTipo {
  valor: TipoVinculo;
  rotulo: string;
  todos: string;
  icone: string;
}

export const TIPOS_VINCULO: ConfigTipo[] = [
  { valor: 'NEGOCIO', rotulo: 'Negócio', todos: 'Todos os negócios', icone: 'lucideBriefcase' },
  { valor: 'SAFRA', rotulo: 'Safra', todos: 'Todas as safras', icone: 'lucideLeaf' },
  { valor: 'PROJETO', rotulo: 'Projeto', todos: 'Todos os projetos', icone: 'lucideFolderOpen' },
];

export function tipoDaNota(nota: INota): TipoVinculo | null {
  if (nota.negocioId != null) return 'NEGOCIO';
  if (nota.safraId != null) return 'SAFRA';
  if (nota.projetoId != null) return 'PROJETO';
  return null;
}

export function idDoVinculo(nota: INota): number | null {
  return nota.negocioId ?? nota.safraId ?? nota.projetoId ?? null;
}

export function nomeDoVinculo(nota: INota): string {
  const id = idDoVinculo(nota);
  return nota.negocioNome ?? nota.safraNome ?? nota.projetoNome ?? (id != null ? `#${id}` : '');
}

export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}