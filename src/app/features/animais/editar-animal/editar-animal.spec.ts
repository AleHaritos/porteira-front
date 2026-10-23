import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarAnimal } from './editar-animal';

describe('EditarAnimal', () => {
  let component: EditarAnimal;
  let fixture: ComponentFixture<EditarAnimal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarAnimal],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarAnimal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
