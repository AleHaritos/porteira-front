import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaContaPendente } from './nova-conta-pendente';

describe('NovaContaPendente', () => {
  let component: NovaContaPendente;
  let fixture: ComponentFixture<NovaContaPendente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaContaPendente],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaContaPendente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
