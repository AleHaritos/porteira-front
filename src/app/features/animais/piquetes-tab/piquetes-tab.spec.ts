import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiquetesTab } from './piquetes-tab';

describe('PiquetesTab', () => {
  let component: PiquetesTab;
  let fixture: ComponentFixture<PiquetesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiquetesTab],
    }).compileComponents();

    fixture = TestBed.createComponent(PiquetesTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
