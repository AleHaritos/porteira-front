import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NegocioDetalhe } from './negocio-detalhe';

describe('NegocioDetalhe', () => {
  let component: NegocioDetalhe;
  let fixture: ComponentFixture<NegocioDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegocioDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(NegocioDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
