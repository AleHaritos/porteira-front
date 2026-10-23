import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperacoesVendaTab } from './operacoes-venda-tab';

describe('OperacoesVendaTab', () => {
  let component: OperacoesVendaTab;
  let fixture: ComponentFixture<OperacoesVendaTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperacoesVendaTab],
    }).compileComponents();

    fixture = TestBed.createComponent(OperacoesVendaTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
