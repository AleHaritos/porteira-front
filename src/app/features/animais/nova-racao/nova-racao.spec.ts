import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaRacao } from './nova-racao';

describe('NovaRacao', () => {
  let component: NovaRacao;
  let fixture: ComponentFixture<NovaRacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaRacao],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaRacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
