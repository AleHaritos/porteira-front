import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransacoesTab } from './transacoes-tab';

describe('TransacoesTab', () => {
  let component: TransacoesTab;
  let fixture: ComponentFixture<TransacoesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransacoesTab],
    }).compileComponents();

    fixture = TestBed.createComponent(TransacoesTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
