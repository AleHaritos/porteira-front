import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustosFixosTalhaoTab } from './custos-fixos-talhao-tab';

describe('CustosFixosTalhaoTab', () => {
  let component: CustosFixosTalhaoTab;
  let fixture: ComponentFixture<CustosFixosTalhaoTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustosFixosTalhaoTab],
    }).compileComponents();

    fixture = TestBed.createComponent(CustosFixosTalhaoTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
