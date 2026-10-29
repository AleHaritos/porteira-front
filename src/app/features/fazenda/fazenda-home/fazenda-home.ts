import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { FazendaService } from '../../../core/services/fazenda-service';
import { IFazenda } from '../../../shared/interfaces/IFazenda';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideBriefcase, lucideCalendarDays, lucideCar, lucideCog, lucideFuel, lucideGauge, lucideHammer, lucideHandshake, lucideListTodo, lucidePackage, lucidePanelLeft, lucidePawPrint, lucideWallet, lucideWheat, lucideWrench } from '@ng-icons/lucide';
import { Location } from '@angular/common';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmSidebarImports, NgIcon],
  providers: [provideIcons({ lucideBriefcase, lucideWallet, lucidePanelLeft, lucideWheat, lucideArrowLeft, lucideCar, lucideFuel, lucideGauge, lucideWrench, lucideHandshake, lucideCog, lucidePawPrint, lucideHammer, lucideCalendarDays, lucideListTodo, lucidePackage  })],
  selector: 'app-fazenda-home',
  styleUrl: './fazenda-home.css',
  templateUrl: './fazenda-home.html',
})
export class FazendaHome implements OnInit {
  private fazendaService = inject(FazendaService);
  private route = inject(ActivatedRoute);
  protected sidebarService = inject(HlmSidebarService);
  private location = inject(Location);

  fazenda = signal<IFazenda | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fazendaService.buscarFazendaPorId(Number(id)).subscribe((res) => {
        this.fazenda.set(res);
      });
    }
  }

   voltar() {
    this.location.back();
  }
}