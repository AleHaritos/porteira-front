import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';

@Component({
  imports: [HlmTabsImports, HlmCardImports],
  selector: 'app-home',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {}
