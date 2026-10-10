import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWallet } from '@ng-icons/lucide';
import { TipoManejo } from '../../../shared/interfaces/IManejo';
import { TalhaoService } from '../../../core/services/safra/talhao-service';
import { ManejoService } from '../../../core/services/safra/manejo-service';

interface CustoPorTipoDatum {
  tipo: TipoManejo;
  label: string;
  valor: number;
}

interface BarraGeometria extends CustoPorTipoDatum {
  valorFormatado: string;
  x: number;
  width: number;
  height: number;
  y: number;
  cor: string;
}

const TIPO_LABELS: Record<TipoManejo, string> = {
  PREPARO_DO_SOLO: 'Preparo do solo',
  PLANTIO: 'Plantio',
  ADUBACAO: 'Adubação',
  PULVERIZACAO: 'Pulverização',
  IRRIGACAO: 'Irrigação',
  COLHEITA: 'Colheita',
  OUTROS: 'Outros',
};

const TIPO_CORES: Record<TipoManejo, string> = {
  PREPARO_DO_SOLO: '#b45309',
  PLANTIO: '#278a4c',
  ADUBACAO: '#d97706',
  PULVERIZACAO: '#4338ca',
  IRRIGACAO: '#1d4ed8',
  COLHEITA: '#be185d',
  OUTROS: '#6b7280',
};

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ALTURA_MAXIMA = 150;
const LARGURA_BARRA = 64;
const ESPACO_ENTRE = 48;
const BASELINE = 170;

@Component({
  selector: 'app-custo-safra-card',
  imports: [HlmCardImports, NgIcon],
  providers: [provideIcons({ lucideWallet })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  styleUrl: './custo-safra-card.css',
  template: `
    <hlm-card class="custo-card py-0">
      <hlm-card-header class="custo-card__header">
        <div class="custo-card__icone">
          <ng-icon name="lucideWallet" size="22" />
        </div>
        <div>
          <p hlmCardDescription>Custo total — {{ nomeSafra() }}</p>
          <h3 hlmCardTitle class="custo-card__total">{{ totalFormatado() }}</h3>
        </div>
      </hlm-card-header>

      <div hlmCardContent class="custo-card__content">
        @if (carregando()) {
          <p class="custo-card__estado">Carregando dados da safra...</p>
        } @else if (dados().length === 0) {
          <p class="custo-card__estado">Nenhum custo registrado para os talhões ativos desta safra</p>
        } @else {
          <svg
            class="custo-card__grafico"
            [attr.viewBox]="'0 0 ' + larguraViewBox() + ' 210'"
            preserveAspectRatio="xMidYMid meet"
          >
            <line x1="0" [attr.x2]="larguraViewBox()" [attr.y1]="baseline" [attr.y2]="baseline" class="custo-card__eixo" />

            @for (barra of geometria(); track barra.tipo) {
              <g class="custo-card__barra-grupo">
                <title>{{ barra.label }}: {{ barra.valorFormatado }}</title>

                <text [attr.x]="barra.x + barra.width / 2" [attr.y]="barra.y - 10" text-anchor="middle" class="custo-card__valor">
                  {{ barra.valorFormatado }}
                </text>

                <rect
                  [attr.x]="barra.x"
                  [attr.y]="barra.y"
                  [attr.width]="barra.width"
                  [attr.height]="barra.height"
                  rx="10"
                  [attr.fill]="barra.cor"
                  class="custo-card__barra"
                />

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
export class CustoSafraCard {
  safraId = input.required<number | null>();
  nomeSafra = input<string>('');

  private talhaoService = inject(TalhaoService);
  private manejoService = inject(ManejoService);

  dados = signal<CustoPorTipoDatum[]>([]);
  total = signal(0);
  carregando = signal(false);

  readonly baseline = BASELINE;

  totalFormatado = computed(() => moeda.format(this.total()));

  geometria = computed<BarraGeometria[]>(() => {
    const dados = this.dados();
    if (dados.length === 0) return [];

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
        cor: TIPO_CORES[d.tipo],
      };
    });
  });

  larguraViewBox = computed(() => {
    const n = this.dados().length;
    return n * (LARGURA_BARRA + ESPACO_ENTRE) + ESPACO_ENTRE / 2;
  });

  constructor() {
    effect(() => {
      const id = this.safraId();
      if (id) {
        this.carregar(id);
      } else {
        this.dados.set([]);
        this.total.set(0);
      }
    });
  }

  private carregar(safraId: number) {
    this.carregando.set(true);

    this.talhaoService.listarTodosPorSafra(safraId).subscribe({
      next: (talhoes) => {
        if (talhoes.length === 0) {
          this.dados.set([]);
          this.total.set(0);
          this.carregando.set(false);
          return;
        }

        const requisicoes = talhoes.map((t) =>
          this.manejoService.listarTodosPorTalhao(t.id).pipe(catchError(() => of([]))),
        );

        forkJoin(requisicoes).subscribe({
          next: (listasDeManejos) => {
            const soma = new Map<TipoManejo, number>();
            let total = 0;

            for (const manejos of listasDeManejos) {
              for (const m of manejos) {
                soma.set(m.tipo, (soma.get(m.tipo) ?? 0) + m.custoTotal);
                total += m.custoTotal;
              }
            }

            const lista: CustoPorTipoDatum[] = Array.from(soma.entries())
              .map(([tipo, valor]) => ({ tipo, label: TIPO_LABELS[tipo], valor }))
              .sort((a, b) => b.valor - a.valor);

            this.dados.set(lista);
            this.total.set(total);
            this.carregando.set(false);
          },
          error: () => this.carregando.set(false),
        });
      },
      error: () => this.carregando.set(false),
    });
  }
}