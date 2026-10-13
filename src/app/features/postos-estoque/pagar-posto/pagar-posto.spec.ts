import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagarPosto } from './pagar-posto';

describe('PagarPosto', () => {
  let component: PagarPosto;
  let fixture: ComponentFixture<PagarPosto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagarPosto],
    }).compileComponents();

    fixture = TestBed.createComponent(PagarPosto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
