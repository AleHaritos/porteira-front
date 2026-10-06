import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function anoAgricolaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) return null; // deixa o required cuidar do vazio

    const match = /^(\d{4})(\/(\d{4}))?$/.exec(valor);
    if (!match) {
      return { anoAgricolaInvalido: true };
    }

    const anoInicial = Number(match[1]);
    const anoFinal = match[3] ? Number(match[3]) : null;

    if (anoFinal !== null && anoFinal !== anoInicial + 1) {
      return { anoAgricolaInvalido: true };
    }

    return null;
  };
}