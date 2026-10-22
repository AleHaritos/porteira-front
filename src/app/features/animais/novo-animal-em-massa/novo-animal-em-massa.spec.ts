import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoAnimalEmMassa } from './novo-animal-em-massa';

describe('NovoAnimalEmMassa', () => {
  let component: NovoAnimalEmMassa;
  let fixture: ComponentFixture<NovoAnimalEmMassa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoAnimalEmMassa],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoAnimalEmMassa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
