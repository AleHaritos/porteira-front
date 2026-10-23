import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoIngrediente } from './novo-ingrediente';

describe('NovoIngrediente', () => {
  let component: NovoIngrediente;
  let fixture: ComponentFixture<NovoIngrediente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoIngrediente],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoIngrediente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
