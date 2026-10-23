import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RacaoTab } from './racao-tab';

describe('RacaoTab', () => {
  let component: RacaoTab;
  let fixture: ComponentFixture<RacaoTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RacaoTab],
    }).compileComponents();

    fixture = TestBed.createComponent(RacaoTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
