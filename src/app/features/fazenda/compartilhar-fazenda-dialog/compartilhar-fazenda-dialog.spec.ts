import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompartilharFazendaDialog } from './compartilhar-fazenda-dialog';

describe('CompartilharFazendaDialog', () => {
  let component: CompartilharFazendaDialog;
  let fixture: ComponentFixture<CompartilharFazendaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompartilharFazendaDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CompartilharFazendaDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
