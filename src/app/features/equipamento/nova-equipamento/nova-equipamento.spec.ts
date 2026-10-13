import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaEquipamento } from './nova-equipamento';

describe('NovaEquipamento', () => {
  let component: NovaEquipamento;
  let fixture: ComponentFixture<NovaEquipamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaEquipamento],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaEquipamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
