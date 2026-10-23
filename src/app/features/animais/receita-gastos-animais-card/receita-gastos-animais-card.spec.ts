import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceitaGastosAnimaisCard } from './receita-gastos-animais-card';

describe('ReceitaGastosAnimaisCard', () => {
  let component: ReceitaGastosAnimaisCard;
  let fixture: ComponentFixture<ReceitaGastosAnimaisCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceitaGastosAnimaisCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceitaGastosAnimaisCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
