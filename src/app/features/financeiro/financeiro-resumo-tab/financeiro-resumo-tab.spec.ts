import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceiroResumoTab } from './financeiro-resumo-tab';

describe('FinanceiroResumoTab', () => {
  let component: FinanceiroResumoTab;
  let fixture: ComponentFixture<FinanceiroResumoTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceiroResumoTab],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceiroResumoTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
