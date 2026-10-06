import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaSafra } from './nova-safra';

describe('NovaSafra', () => {
  let component: NovaSafra;
  let fixture: ComponentFixture<NovaSafra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaSafra],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaSafra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
