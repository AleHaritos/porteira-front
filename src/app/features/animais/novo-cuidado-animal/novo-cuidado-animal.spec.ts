import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoCuidadoAnimal } from './novo-cuidado-animal';

describe('NovoCuidadoAnimal', () => {
  let component: NovoCuidadoAnimal;
  let fixture: ComponentFixture<NovoCuidadoAnimal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoCuidadoAnimal],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoCuidadoAnimal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
