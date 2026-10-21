import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FornecedorDetalhe } from './fornecedor-detalhe';

describe('FornecedorDetalhe', () => {
  let component: FornecedorDetalhe;
  let fixture: ComponentFixture<FornecedorDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FornecedorDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(FornecedorDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
