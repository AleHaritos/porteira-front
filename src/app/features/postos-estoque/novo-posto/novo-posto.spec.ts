import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoPosto } from './novo-posto';

describe('NovoPosto', () => {
  let component: NovoPosto;
  let fixture: ComponentFixture<NovoPosto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoPosto],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoPosto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
