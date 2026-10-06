import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { ManejosTab } from '../manejos-tab/manejos-tab';
import { ProdutosTab } from '../produtos-tab/produtos-tab';
import { TalhoesTab } from '../talhoes-tab/talhoes-tab';

type AbaSafra = 'talhoes' | 'manejos' | 'produtos';

@Component({
  selector: 'app-safra-detalhes',
  imports: [HlmTabsImports, TalhoesTab, ManejosTab, ProdutosTab],
  styleUrl: './safra-detalhes.css',
  templateUrl: './safra-detalhes.html',
})
export class SafraDetalhes implements OnInit {
  private route = inject(ActivatedRoute);

  safraId!: number;
  fazendaId!: number;

  abaAtiva = signal<AbaSafra>('talhoes');

  ngOnInit(): void {
    this.safraId = Number(this.route.snapshot.paramMap.get('safraId'));
    this.fazendaId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  }

  selecionarAba(aba: AbaSafra) {
    this.abaAtiva.set(aba);
  }
}