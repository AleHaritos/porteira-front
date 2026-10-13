import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagarFornecedor } from './pagar-fornecedor';

describe('PagarFornecedor', () => {
  let component: PagarFornecedor;
  let fixture: ComponentFixture<PagarFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagarFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(PagarFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
