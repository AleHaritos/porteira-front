import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhesOperacaoVenda } from './detalhes-operacao-venda';

describe('DetalhesOperacaoVenda', () => {
  let component: DetalhesOperacaoVenda;
  let fixture: ComponentFixture<DetalhesOperacaoVenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesOperacaoVenda],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesOperacaoVenda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
