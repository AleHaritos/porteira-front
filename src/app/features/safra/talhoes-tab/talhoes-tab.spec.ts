import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TalhoesTab } from './talhoes-tab';

describe('TalhoesTab', () => {
  let component: TalhoesTab;
  let fixture: ComponentFixture<TalhoesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalhoesTab],
    }).compileComponents();

    fixture = TestBed.createComponent(TalhoesTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
