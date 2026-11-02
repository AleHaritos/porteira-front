import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SafraResumoTalhoes } from './safra-resumo-talhoes';

describe('SafraResumoTalhoes', () => {
  let component: SafraResumoTalhoes;
  let fixture: ComponentFixture<SafraResumoTalhoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafraResumoTalhoes],
    }).compileComponents();

    fixture = TestBed.createComponent(SafraResumoTalhoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
