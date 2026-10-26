import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumoVeiculo } from './resumo-veiculo';

describe('ResumoVeiculo', () => {
  let component: ResumoVeiculo;
  let fixture: ComponentFixture<ResumoVeiculo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoVeiculo],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoVeiculo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
