import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarCompraEstoque } from './registrar-compra-estoque';

describe('RegistrarCompraEstoque', () => {
  let component: RegistrarCompraEstoque;
  let fixture: ComponentFixture<RegistrarCompraEstoque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarCompraEstoque],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarCompraEstoque);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
