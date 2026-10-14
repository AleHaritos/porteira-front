import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoLote } from './novo-lote';

describe('NovoLote', () => {
  let component: NovoLote;
  let fixture: ComponentFixture<NovoLote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoLote],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoLote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
