import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaTransacao } from './nova-transacao';

describe('NovaTransacao', () => {
  let component: NovaTransacao;
  let fixture: ComponentFixture<NovaTransacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaTransacao],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaTransacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
