import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoConsultas } from './historico-consultas';

describe('HistoricoConsultas', () => {
  let component: HistoricoConsultas;
  let fixture: ComponentFixture<HistoricoConsultas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoConsultas],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoConsultas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
