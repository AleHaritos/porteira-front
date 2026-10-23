import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBarChart3 } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

interface SegmentoGeometria {
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
const LARGURA_BARRA = 90;
const ESPACO_ENTRE = 70;
const BASELINE = 170;

const COR_RECEITA = '#278a4c';
const COR_ALIMENTACAO = '#d97706';
const COR_VACINACAO = '#1d4ed8';

@Component({
  selector: 'app-receita-gastos-animais-card',
  imports: [HlmCardImports, NgIcon],
  providers: [provideIcons({ lucideBarChart3 })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full h-full' },
  styleUrl: './receita-gastos-animais-card.css',
  template: `
    <hlm-card class="custo-card py-0">
      <hlm-card-header class="custo-card__header">
        <div class="custo-card__icone">
          <ng-icon name="lucideBarChart3" size="22" />
        </div>
        <div>
          <p hlmCardDescription>Receita x Gastos</p>
          <h3 hlmCardTitle class="custo-card__total" [class.custo-card__total--negativo]="lucro() < 0">
            {{ lucroFormatado() }}
          </h3>
        </div>
      </hlm-card-header>

      <div hlmCardContent class="custo-card__content">
        <svg class="custo-card__grafico" [attr.viewBox]="'0 0 ' + larguraViewBox + ' 210'" preserveAspectRatio="xMidYMid meet">
          <line x1="0" [attr.x2]="larguraViewBox" [attr.y1]="baseline" [attr.y2]="baseline" class="custo-card__eixo" />

          <g class="custo-card__barra-grupo">
            <title>Receita: {{ receitaFormatada() }}</title>
            <text [attr.x]="receitaBarra().x + receitaBarra().width / 2" [attr.y]="receitaBarra().y - 10" text-anchor="middle" class="custo-card__valor">
              {{ receitaFormatada() }}
            </text>
            <rect [attr.x]="receitaBarra().x" [attr.y]="receitaBarra().y" [attr.width]="receitaBarra().width" [attr.height]="receitaBarra().height" rx="10"
              [attr.fill]="receitaBarra().cor" class="custo-card__barra" />
            <text [attr.x]="receitaBarra().x + receitaBarra().width / 2" [attr.y]="baseline + 22" text-anchor="middle" class="custo-card__rotulo">
              Receita
            </text>
          </g>

          <g class="custo-card__barra-grupo">
            <title>Gastos: {{ gastosTotalFormatado() }}</title>
            <text [attr.x]="gastosX() + (90 / 2)" [attr.y]="gastosTopo() - 10" text-anchor="middle" class="custo-card__valor">
              {{ gastosTotalFormatado() }}
            </text>

            @for (seg of segmentosGastos(); track seg.label) {
              <rect [attr.x]="seg.x" [attr.y]="seg.y" [attr.width]="seg.width" [attr.height]="seg.height" [attr.fill]="seg.cor"
                class="custo-card__barra custo-card__barra--segmento">
                <title>{{ seg.label }}: {{ seg.valorFormatado }}</title>
              </rect>
            }

            <text [attr.x]="gastosX() + (90 / 2)" [attr.y]="baseline + 22" text-anchor="middle" class="custo-card__rotulo">
              Gastos
            </text>
          </g>
        </svg>

        <div class="custo-card__legenda">
          @for (seg of legenda(); track seg.label) {
            <div class="custo-card__legenda-item">
              <span class="custo-card__legenda-bolinha" [style.background]="seg.cor"></span>
              <span class="custo-card__legenda-texto">{{ seg.label }}</span>
              <span class="custo-card__legenda-valor">{{ seg.valorFormatado }}</span>
            </div>
          }
        </div>
      </div>
    </hlm-card>
  `,
})
export class ReceitaGastosAnimaisCard {
  receita = input<number>(0);
  gastoAlimentacao = input<number>(0);
  gastoVacinacao = input<number>(0);

  readonly baseline = BASELINE;
  readonly larguraViewBox = 2 * (LARGURA_BARRA + ESPACO_ENTRE) + ESPACO_ENTRE / 2;

  gastosTotal = computed(() => this.gastoAlimentacao() + this.gastoVacinacao());
  lucro = computed(() => this.receita() - this.gastosTotal());
  lucroFormatado = computed(() => moeda.format(this.lucro()));
  receitaFormatada = computed(() => moeda.format(this.receita()));
  gastosTotalFormatado = computed(() => moeda.format(this.gastosTotal()));

  private escala = computed(() => {
    const maxValor = Math.max(this.receita(), this.gastosTotal(), 1);
    return ALTURA_MAXIMA / maxValor;
  });

  receitaBarra = computed<SegmentoGeometria>(() => {
    const altura = this.receita() * this.escala();
    return {
      label: 'Receita',
      valor: this.receita(),
      valorFormatado: this.receitaFormatada(),
      x: ESPACO_ENTRE / 2,
      width: LARGURA_BARRA,
      height: altura,
      y: BASELINE - altura,
      cor: COR_RECEITA,
    };
  });

  gastosX = computed(() => LARGURA_BARRA + ESPACO_ENTRE + ESPACO_ENTRE / 2);

  private origemGastos = computed(() => [
    { label: 'Alimentação', valor: this.gastoAlimentacao(), cor: COR_ALIMENTACAO },
    { label: 'Vacinação', valor: this.gastoVacinacao(), cor: COR_VACINACAO },
  ]);

  segmentosGastos = computed<SegmentoGeometria[]>(() => {
    const escala = this.escala();
    const x = this.gastosX();
    const ALTURA_MINIMA = 4;
    let acumulado = 0;

    return this.origemGastos().map((seg) => {
      let altura = seg.valor * escala;
      if (seg.valor > 0 && altura < ALTURA_MINIMA) {
        altura = ALTURA_MINIMA;
      }
      const y = BASELINE - acumulado - altura;
      acumulado += altura;
      return { ...seg, x, width: LARGURA_BARRA, height: altura, y, valorFormatado: moeda.format(seg.valor) };
    });
  });

  legenda = computed(() => this.origemGastos().map((seg) => ({ ...seg, valorFormatado: moeda.format(seg.valor) })));

  gastosTopo = computed(() => {
    const segmentos = this.segmentosGastos();
    if (segmentos.length === 0) return BASELINE;
    return Math.min(...segmentos.map((s) => s.y));
  });
}