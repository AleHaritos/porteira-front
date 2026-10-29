import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoProjeto } from './novo-projeto';

describe('NovoProjeto', () => {
  let component: NovoProjeto;
  let fixture: ComponentFixture<NovoProjeto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoProjeto],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoProjeto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
