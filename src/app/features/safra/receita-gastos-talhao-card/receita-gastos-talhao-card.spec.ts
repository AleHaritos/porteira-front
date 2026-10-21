import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceitaGastosTalhaoCard } from './receita-gastos-talhao-card';

describe('ReceitaGastosTalhaoCard', () => {
  let component: ReceitaGastosTalhaoCard;
  let fixture: ComponentFixture<ReceitaGastosTalhaoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceitaGastosTalhaoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceitaGastosTalhaoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
