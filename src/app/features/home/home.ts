import { ChangeDetectionStrategy, Component, inject, OnInit, signal, Signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { FazendaService } from '../../core/services/fazenda-service';
import { IFazenda } from '../../shared/intefaces/IFazenda';

@Component({
  imports: [HlmTabsImports, HlmCardImports],
  selector: 'app-home',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private fazendaService = inject(FazendaService)

  fazendas = signal<IFazenda[]>([]);

  ngOnInit(): void {
    this.fazendaService.listarFazendas().subscribe(res => {
      this.fazendas.set(res)
      console.log(this.fazendas())
    })
  }
}
