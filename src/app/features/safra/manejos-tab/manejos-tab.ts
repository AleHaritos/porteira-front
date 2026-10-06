import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-manejos-tab',
  styleUrl: './manejos-tab.css',
  templateUrl: './manejos-tab.html',
})
export class ManejosTab {
  safraId = input.required<number>();
}
