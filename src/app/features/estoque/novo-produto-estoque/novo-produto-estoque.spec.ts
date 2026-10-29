import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoProdutoEstoque } from './novo-produto-estoque';

describe('NovoProdutoEstoque', () => {
  let component: NovoProdutoEstoque;
  let fixture: ComponentFixture<NovoProdutoEstoque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoProdutoEstoque],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoProdutoEstoque);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
