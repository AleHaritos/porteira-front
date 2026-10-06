import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Safra } from './safra';

describe('Safra', () => {
  let component: Safra;
  let fixture: ComponentFixture<Safra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Safra],
    }).compileComponents();

    fixture = TestBed.createComponent(Safra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
