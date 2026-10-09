import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoNegocio } from './novo-negocio';

describe('NovoNegocio', () => {
  let component: NovoNegocio;
  let fixture: ComponentFixture<NovoNegocio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoNegocio],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoNegocio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
