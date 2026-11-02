import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SafraResumo } from './safra-resumo';

describe('SafraResumo', () => {
  let component: SafraResumo;
  let fixture: ComponentFixture<SafraResumo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafraResumo],
    }).compileComponents();

    fixture = TestBed.createComponent(SafraResumo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
