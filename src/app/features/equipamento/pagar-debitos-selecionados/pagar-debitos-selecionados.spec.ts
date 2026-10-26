import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagarDebitosSelecionados } from './pagar-debitos-selecionados';

describe('PagarDebitosSelecionados', () => {
  let component: PagarDebitosSelecionados;
  let fixture: ComponentFixture<PagarDebitosSelecionados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagarDebitosSelecionados],
    }).compileComponents();

    fixture = TestBed.createComponent(PagarDebitosSelecionados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
