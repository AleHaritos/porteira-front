import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { ContasPendentes } from './contas-pendentes/contas-pendentes';
import { FinanceiroResumoTab } from './financeiro-resumo-tab/financeiro-resumo-tab';
import { TransacoesTab } from './transacoes-tab/transacoes-tab';
import { CommonModule } from '@angular/common';

type AbaFinanceiro = 'financeiro' | 'transacoes' | 'pendentes';

@Component({
  selector: 'app-financeiro',
  imports: [HlmTabsImports, FinanceiroResumoTab, TransacoesTab, ContasPendentes, CommonModule],
  styleUrl: './financeiro.css',
  templateUrl: './financeiro.html',
})
export class Financeiro implements OnInit {
  private route = inject(ActivatedRoute);

  fazendaId = signal<number | null>(null);
  abaAtiva = signal<AbaFinanceiro>('financeiro');

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
    });
  }

  selecionarAba(aba: AbaFinanceiro) {
    this.abaAtiva.set(aba);
  }
}