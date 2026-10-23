import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideMapPin } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { PiqueteService } from '../../../core/services/animais/piquete-service';
import { ToastService } from '../../../core/services/toast-service';
import { IPiquete } from '../../../shared/interfaces/IPiquete';
import { AnimaisTab } from '../animais-tab/animais-tab';
import { CuidadoAnimalTab } from '../cuidado-animal-tab/cuidado-animal-tab';

type AbaPiquete = 'animais' | 'vacinacao' | 'alimentacao';

@Component({
  selector: 'app-piquete-detalhes',
  imports: [CommonModule, HlmButtonImports, HlmTabsImports, NgIcon, AnimaisTab, CuidadoAnimalTab],
  providers: [provideIcons({ lucideArrowLeft, lucideMapPin })],
  styleUrl: './piquete-detalhes.css',
  templateUrl: './piquete-detalhes.html',
})
export class PiqueteDetalhes implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private piqueteService = inject(PiqueteService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  piqueteId = signal<number | null>(null);
  piquete = signal<IPiquete | null>(null);

  abaAtiva = signal<AbaPiquete>('animais');

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('piqueteId');
      this.piqueteId.set(id ? Number(id) : null);
      if (id) this.carregarPiquete(Number(id));
    });
  }

  selecionarAba(aba: AbaPiquete): void {
    this.abaAtiva.set(aba);
  }

  carregarPiquete(id: number): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.piqueteService.listarPorFazenda(fazendaId).subscribe({
      next: (res) => {
        this.piquete.set(res.find((p) => p.id === id) ?? null);
      },
      error: () => this.toastService.showError('Erro', 'Não foi possível carregar o piquete'),
    });
  }

  voltar(): void {
    this.router.navigate(['animais'], { relativeTo: this.route.parent });
  }
}