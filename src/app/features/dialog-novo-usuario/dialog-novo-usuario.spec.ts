import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogNovoUsuario } from './dialog-novo-usuario';

describe('DialogNovoUsuario', () => {
  let component: DialogNovoUsuario;
  let fixture: ComponentFixture<DialogNovoUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogNovoUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogNovoUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
