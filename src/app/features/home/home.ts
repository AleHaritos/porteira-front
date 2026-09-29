import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { FazendaService } from '../../core/services/fazenda-service';

@Component({
  imports: [HlmTabsImports, HlmCardImports],
  selector: 'app-home',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private fazendaService = inject(FazendaService)

  ngOnInit(): void {
    this.fazendaService.listarFazendas().subscribe(res => {
      console.log(res)
    })
  }
}
