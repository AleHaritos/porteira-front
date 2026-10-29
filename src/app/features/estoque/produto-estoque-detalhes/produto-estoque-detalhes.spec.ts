import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProdutoEstoqueDetalhes } from './produto-estoque-detalhes';

describe('ProdutoEstoqueDetalhes', () => {
  let component: ProdutoEstoqueDetalhes;
  let fixture: ComponentFixture<ProdutoEstoqueDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutoEstoqueDetalhes],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdutoEstoqueDetalhes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
