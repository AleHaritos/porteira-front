import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaVeiculo } from './nova-veiculo';

describe('NovaVeiculo', () => {
  let component: NovaVeiculo;
  let fixture: ComponentFixture<NovaVeiculo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaVeiculo],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaVeiculo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
