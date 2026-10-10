import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContasPendentes } from './contas-pendentes';

describe('ContasPendentes', () => {
  let component: ContasPendentes;
  let fixture: ComponentFixture<ContasPendentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContasPendentes],
    }).compileComponents();

    fixture = TestBed.createComponent(ContasPendentes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
