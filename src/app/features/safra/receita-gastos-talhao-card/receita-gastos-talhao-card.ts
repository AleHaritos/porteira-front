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
const COR_COMBUSTIVEL = '#2563eb';
const COR_MANUTENCAO = '#0891b2';
const COR_RATEIO_OUTROS = '#b45309';
const COR_CUSTOS_FIXOS = '#eab308';
const COR_MANEJO = '#7c3aed';

@Component({
  selector: 'app-receita-gastos-talhao-card',
  imports: [HlmCardImports, NgIcon],
  providers: [provideIcons({ lucideBarChart3 })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  styleUrl: './receita-gastos-talhao-card.css',
  template: `
    <hlm-card class="custo-card py-0">
      <hlm-card-header class="custo-card__header">
        <div class="custo-card__icone">
          <ng-icon name="lucideBarChart3" size="22" />
        </div>
        <div>
          <p hlmCardDescription>Receita x Gastos — {{ nomeTalhao() }}</p>
          <h3 hlmCardTitle class="custo-card__total" [class.custo-card__total--negativo]="lucro() < 0">
            {{ lucroFormatado() }}
          </h3>
        </div>
      </hlm-card-header>

      <div hlmCardContent class="custo-card__content">
        <svg
          class="custo-card__grafico"
          [attr.viewBox]="'0 0 ' + larguraViewBox() + ' 210'"
          preserveAspectRatio="xMidYMid meet"
        >
          <line x1="0" [attr.x2]="larguraViewBox()" [attr.y1]="baseline" [attr.y2]="baseline" class="custo-card__eixo" />

          <!-- Receita -->
          <g class="custo-card__barra-grupo">
            <title>Receita: {{ receitaFormatada() }}</title>

            <text
              [attr.x]="receitaBarra().x + receitaBarra().width / 2"
              [attr.y]="receitaBarra().y - 10"
              text-anchor="middle"
              class="custo-card__valor"
            >
              {{ receitaFormatada() }}
            </text>

            <rect
              [attr.x]="receitaBarra().x"
              [attr.y]="receitaBarra().y"
              [attr.width]="receitaBarra().width"
              [attr.height]="receitaBarra().height"
              rx="10"
              [attr.fill]="receitaBarra().cor"
              class="custo-card__barra"
            />

            <text
              [attr.x]="receitaBarra().x + receitaBarra().width / 2"
              [attr.y]="baseline + 22"
              text-anchor="middle"
              class="custo-card__rotulo"
            >
              Receita
            </text>
          </g>

          <!-- Gastos (empilhado) -->
          <g class="custo-card__barra-grupo">
            <title>Gastos: {{ gastosTotalFormatado() }}</title>

            <text
              [attr.x]="gastosX() + (90 / 2)"
              [attr.y]="gastosTopo() - 10"
              text-anchor="middle"
              class="custo-card__valor"
            >
              {{ gastosTotalFormatado() }}
            </text>

            @for (seg of segmentosGastos(); track seg.label) {
              <rect
                [attr.x]="seg.x"
                [attr.y]="seg.y"
                [attr.width]="seg.width"
                [attr.height]="seg.height"
                [attr.fill]="seg.cor"
                class="custo-card__barra custo-card__barra--segmento"
              >
                <title>{{ seg.label }}: {{ seg.valorFormatado }}</title>
              </rect>
            }

            <text
              [attr.x]="gastosX() + (90 / 2)"
              [attr.y]="baseline + 22"
              text-anchor="middle"
              class="custo-card__rotulo"
            >
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
export class ReceitaGastosTalhaoCard {
  nomeTalhao = input<string>('');
  receita = input<number>(0);
  custoRateioTotal = input<number>(0);
  custoCombustivel = input<number>(0);
  custoManutencao = input<number>(0);
  custoFixos = input<number>(0);
  custoManejo = input<number>(0);

  readonly baseline = BASELINE;

  custoRateioOutros = computed(() =>
    Math.max(0, this.custoRateioTotal() - this.custoCombustivel() - this.custoManutencao()),
  );

  gastosTotal = computed(
    () => this.custoRateioTotal() + this.custoFixos() + this.custoManejo(),
  );
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
    { label: 'Combustível', valor: this.custoCombustivel(), cor: COR_COMBUSTIVEL },
    { label: 'Manutenção', valor: this.custoManutencao(), cor: COR_MANUTENCAO },
    { label: 'Outros custos do rateio', valor: this.custoRateioOutros(), cor: COR_RATEIO_OUTROS },
    { label: 'Custos Fixos', valor: this.custoFixos(), cor: COR_CUSTOS_FIXOS },
    { label: 'Custo de Manejo', valor: this.custoManejo(), cor: COR_MANEJO },
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

  legenda = computed(() =>
    this.origemGastos().map((seg) => ({ ...seg, valorFormatado: moeda.format(seg.valor) })),
  );

  gastosTopo = computed(() => {
    const segmentos = this.segmentosGastos();
    if (segmentos.length === 0) return BASELINE;
    return Math.min(...segmentos.map((s) => s.y));
  });

  larguraViewBox = computed(() => 2 * (LARGURA_BARRA + ESPACO_ENTRE) + ESPACO_ENTRE / 2);
}