import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { FazendaService } from '../../../core/services/fazenda-service';
import { IFazenda } from '../../../shared/intefaces/IFazenda';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBriefcase, lucidePanelLeft, lucideWallet, lucideWheat } from '@ng-icons/lucide';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmSidebarImports, NgIcon],
  providers: [provideIcons({ lucideBriefcase, lucideWallet, lucidePanelLeft, lucideWheat })],
  selector: 'app-fazenda-home',
  styleUrl: './fazenda-home.css',
  templateUrl: './fazenda-home.html',
})
export class FazendaHome implements OnInit {
  private fazendaService = inject(FazendaService);
  private route = inject(ActivatedRoute);
  protected sidebarService = inject(HlmSidebarService);

  fazenda = signal<IFazenda | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fazendaService.buscarFazendaPorId(Number(id)).subscribe((res) => {
        this.fazenda.set(res);
      });
    }
  }
}