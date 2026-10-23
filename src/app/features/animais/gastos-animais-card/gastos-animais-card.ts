import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWallet } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

interface BarraGeometria {
  label: string;
  valor: number;
  valorFormatado: string;
  x: number;
  width: number;
  height: number;
  y: number;
  cor: string;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ALTURA_MAXIMA = 150;
const LARGURA_BARRA = 64;
const ESPACO_ENTRE = 48;
const BASELINE = 170;

const COR_ALIMENTACAO = '#d97706';
const COR_VACINACAO = '#1d4ed8';

@Component({
  selector: 'app-gastos-animais-card',
  imports: [HlmCardImports, NgIcon],
  providers: [provideIcons({ lucideWallet })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full h-full' },
  styleUrl: './gastos-animais-card.css',
  template: `
    <hlm-card class="custo-card py-0">
      <hlm-card-header class="custo-card__header">
        <div class="custo-card__icone">
          <ng-icon name="lucideWallet" size="22" />
        </div>
        <div>
          <p hlmCardDescription>Gastos por Tipo</p>
          <h3 hlmCardTitle class="custo-card__total">{{ totalFormatado() }}</h3>
        </div>
      </hlm-card-header>

      <div hlmCardContent class="custo-card__content">
        @if (total() === 0) {
          <p class="custo-card__estado">Nenhum gasto registrado no período selecionado</p>
        } @else {
          <svg class="custo-card__grafico" [attr.viewBox]="'0 0 ' + larguraViewBox + ' 210'" preserveAspectRatio="xMidYMid meet">
            <line x1="0" [attr.x2]="larguraViewBox" [attr.y1]="baseline" [attr.y2]="baseline" class="custo-card__eixo" />

            @for (barra of geometria(); track barra.label) {
              <g class="custo-card__barra-grupo">
                <title>{{ barra.label }}: {{ barra.valorFormatado }}</title>

                <text [attr.x]="barra.x + barra.width / 2" [attr.y]="barra.y - 10" text-anchor="middle" class="custo-card__valor">
                  {{ barra.valorFormatado }}
                </text>

                <rect [attr.x]="barra.x" [attr.y]="barra.y" [attr.width]="barra.width" [attr.height]="barra.height" rx="10"
                  [attr.fill]="barra.cor" class="custo-card__barra" />

                <text [attr.x]="barra.x + barra.width / 2" [attr.y]="baseline + 22" text-anchor="middle" class="custo-card__rotulo">
                  {{ barra.label }}
                </text>
              </g>
            }
          </svg>
        }
      </div>
    </hlm-card>
  `,
})
export class GastosAnimaisCard {
  gastoAlimentacao = input<number>(0);
  gastoVacinacao = input<number>(0);

  readonly baseline = BASELINE;
  readonly larguraViewBox = 2 * (LARGURA_BARRA + ESPACO_ENTRE) + ESPACO_ENTRE / 2;

  total = computed(() => this.gastoAlimentacao() + this.gastoVacinacao());
  totalFormatado = computed(() => moeda.format(this.total()));

  geometria = computed<BarraGeometria[]>(() => {
    const dados = [
      { label: 'Alimentação', valor: this.gastoAlimentacao(), cor: COR_ALIMENTACAO },
      { label: 'Vacinação', valor: this.gastoVacinacao(), cor: COR_VACINACAO },
    ];

    const maxValor = Math.max(...dados.map((d) => d.valor), 1);

    return dados.map((d, i) => {
      const altura = (d.valor / maxValor) * ALTURA_MAXIMA;
      return {
        ...d,
        valorFormatado: moeda.format(d.valor),
        x: i * (LARGURA_BARRA + ESPACO_ENTRE) + ESPACO_ENTRE / 2,
        width: LARGURA_BARRA,
        height: altura,
        y: BASELINE - altura,
      };
    });
  });
}