import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaManutencaoParcelada } from './nova-manutencao-parcelada';

describe('NovaManutencaoParcelada', () => {
  let component: NovaManutencaoParcelada;
  let fixture: ComponentFixture<NovaManutencaoParcelada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaManutencaoParcelada],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaManutencaoParcelada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
