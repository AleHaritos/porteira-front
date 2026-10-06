import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-produtos-tab',
  styleUrl: './produtos-tab.css',
  templateUrl: './produtos-tab.html',
})
export class ProdutosTab {
  safraId = input.required<number>();
}
