import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManejosTab } from './manejos-tab';

describe('ManejosTab', () => {
  let component: ManejosTab;
  let fixture: ComponentFixture<ManejosTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManejosTab],
    }).compileComponents();

    fixture = TestBed.createComponent(ManejosTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
