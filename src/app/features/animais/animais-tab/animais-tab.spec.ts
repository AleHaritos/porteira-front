import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimaisTab } from './animais-tab';

describe('AnimaisTab', () => {
  let component: AnimaisTab;
  let fixture: ComponentFixture<AnimaisTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimaisTab],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimaisTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
