import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjetoDetalhe } from './projeto-detalhe';

describe('ProjetoDetalhe', () => {
  let component: ProjetoDetalhe;
  let fixture: ComponentFixture<ProjetoDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetoDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjetoDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
