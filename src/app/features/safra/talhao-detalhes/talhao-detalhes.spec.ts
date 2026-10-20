import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TalhaoDetalhes } from './talhao-detalhes';

describe('TalhaoDetalhes', () => {
  let component: TalhaoDetalhes;
  let fixture: ComponentFixture<TalhaoDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalhaoDetalhes],
    }).compileComponents();

    fixture = TestBed.createComponent(TalhaoDetalhes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
