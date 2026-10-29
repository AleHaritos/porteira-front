import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Projeto } from './projeto';

describe('Projeto', () => {
  let component: Projeto;
  let fixture: ComponentFixture<Projeto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projeto],
    }).compileComponents();

    fixture = TestBed.createComponent(Projeto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
