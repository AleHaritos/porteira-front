import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumoAnimaisTab } from './resumo-animais-tab';

describe('ResumoAnimaisTab', () => {
  let component: ResumoAnimaisTab;
  let fixture: ComponentFixture<ResumoAnimaisTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoAnimaisTab],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoAnimaisTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
