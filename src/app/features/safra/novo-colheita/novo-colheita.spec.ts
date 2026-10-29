import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoColheita } from './novo-colheita';

describe('NovoColheita', () => {
  let component: NovoColheita;
  let fixture: ComponentFixture<NovoColheita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoColheita],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoColheita);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
