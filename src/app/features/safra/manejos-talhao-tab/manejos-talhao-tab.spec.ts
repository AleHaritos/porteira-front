import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManejosTalhaoTab } from './manejos-talhao-tab';

describe('ManejosTalhaoTab', () => {
  let component: ManejosTalhaoTab;
  let fixture: ComponentFixture<ManejosTalhaoTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManejosTalhaoTab],
    }).compileComponents();

    fixture = TestBed.createComponent(ManejosTalhaoTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
