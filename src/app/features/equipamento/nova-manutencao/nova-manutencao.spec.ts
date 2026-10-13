import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaManutencao } from './nova-manutencao';

describe('NovaManutencao', () => {
  let component: NovaManutencao;
  let fixture: ComponentFixture<NovaManutencao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaManutencao],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaManutencao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
