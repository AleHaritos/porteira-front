import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumoEquipamento } from './resumo-equipamento';

describe('ResumoEquipamento', () => {
  let component: ResumoEquipamento;
  let fixture: ComponentFixture<ResumoEquipamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoEquipamento],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoEquipamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
