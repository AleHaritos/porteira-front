import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogNovaFazenda } from './dialog-nova-fazenda';

describe('DialogNovaFazenda', () => {
  let component: DialogNovaFazenda;
  let fixture: ComponentFixture<DialogNovaFazenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogNovaFazenda],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogNovaFazenda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
