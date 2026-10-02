import { Component, inject, OnInit, signal } from '@angular/core';
import { FazendaService } from '../../core/services/fazenda-service';
import { ActivatedRoute } from '@angular/router';
import { IFazenda } from '../../shared/intefaces/IFazenda';

@Component({
  imports: [],
  selector: 'app-fazenda-home',
  styleUrl: './fazenda-home.css',
  templateUrl: './fazenda-home.html',
})
export class FazendaHome implements OnInit{
  private fazendaService = inject(FazendaService);
  private route = inject(ActivatedRoute);

  fazenda = signal<IFazenda | null>(null);

  ngOnInit(): void {
     const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fazendaService.buscarFazendaPorId(Number(id)).subscribe((res) => {
        this.fazenda.set(res);
        console.log(this.fazenda())
      });
    }
  }
}
