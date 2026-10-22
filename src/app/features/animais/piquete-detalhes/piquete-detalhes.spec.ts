import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiqueteDetalhes } from './piquete-detalhes';

describe('PiqueteDetalhes', () => {
  let component: PiqueteDetalhes;
  let fixture: ComponentFixture<PiqueteDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiqueteDetalhes],
    }).compileComponents();

    fixture = TestBed.createComponent(PiqueteDetalhes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
