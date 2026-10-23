import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroUnicoAnimal } from './cadastro-unico-animal';

describe('CadastroUnicoAnimal', () => {
  let component: CadastroUnicoAnimal;
  let fixture: ComponentFixture<CadastroUnicoAnimal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroUnicoAnimal],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroUnicoAnimal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
