import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SafraDetalhes } from './safra-detalhes';

describe('SafraDetalhes', () => {
  let component: SafraDetalhes;
  let fixture: ComponentFixture<SafraDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafraDetalhes],
    }).compileComponents();

    fixture = TestBed.createComponent(SafraDetalhes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
