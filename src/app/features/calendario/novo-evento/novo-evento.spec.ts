import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoEvento } from './novo-evento';

describe('NovoEvento', () => {
  let component: NovoEvento;
  let fixture: ComponentFixture<NovoEvento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoEvento],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoEvento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
