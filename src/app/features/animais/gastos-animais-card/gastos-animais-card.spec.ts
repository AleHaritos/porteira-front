import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastosAnimaisCard } from './gastos-animais-card';

describe('GastosAnimaisCard', () => {
  let component: GastosAnimaisCard;
  let fixture: ComponentFixture<GastosAnimaisCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GastosAnimaisCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GastosAnimaisCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
