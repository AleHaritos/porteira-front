import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CuidadoAnimalTab } from './cuidado-animal-tab';

describe('CuidadoAnimalTab', () => {
  let component: CuidadoAnimalTab;
  let fixture: ComponentFixture<CuidadoAnimalTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuidadoAnimalTab],
    }).compileComponents();

    fixture = TestBed.createComponent(CuidadoAnimalTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
