import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodosAnimaisTab } from './todos-animais-tab';

describe('TodosAnimaisTab', () => {
  let component: TodosAnimaisTab;
  let fixture: ComponentFixture<TodosAnimaisTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosAnimaisTab],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosAnimaisTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
