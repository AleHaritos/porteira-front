import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoTalhao } from './novo-talhao';

describe('NovoTalhao', () => {
  let component: NovoTalhao;
  let fixture: ComponentFixture<NovoTalhao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoTalhao],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoTalhao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
