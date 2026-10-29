import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaTarefa } from './nova-tarefa';

describe('NovaTarefa', () => {
  let component: NovaTarefa;
  let fixture: ComponentFixture<NovaTarefa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaTarefa],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaTarefa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
