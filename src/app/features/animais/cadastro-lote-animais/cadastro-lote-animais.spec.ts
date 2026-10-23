import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroLoteAnimais } from './cadastro-lote-animais';

describe('CadastroLoteAnimais', () => {
  let component: CadastroLoteAnimais;
  let fixture: ComponentFixture<CadastroLoteAnimais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroLoteAnimais],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroLoteAnimais);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
