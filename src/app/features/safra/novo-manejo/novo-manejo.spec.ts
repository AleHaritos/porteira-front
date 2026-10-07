import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoManejo } from './novo-manejo';

describe('NovoManejo', () => {
  let component: NovoManejo;
  let fixture: ComponentFixture<NovoManejo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoManejo],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoManejo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
