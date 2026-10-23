import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoAnimal } from './historico-animal';

describe('HistoricoAnimal', () => {
  let component: HistoricoAnimal;
  let fixture: ComponentFixture<HistoricoAnimal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoAnimal],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoAnimal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
