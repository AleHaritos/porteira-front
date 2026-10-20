import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagarDebitoFornecedor } from './pagar-debito-fornecedor';

describe('PagarDebitoFornecedor', () => {
  let component: PagarDebitoFornecedor;
  let fixture: ComponentFixture<PagarDebitoFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagarDebitoFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(PagarDebitoFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
