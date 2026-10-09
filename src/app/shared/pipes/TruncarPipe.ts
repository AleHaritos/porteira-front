import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncar',
  standalone: true,
})
export class TruncarPipe implements PipeTransform {
  transform(valor: string | null | undefined, limite: number = 30): string {
    if (!valor) return '';
    return valor.length > limite ? `${valor.slice(0, limite).trimEnd()}...` : valor;
  }
}