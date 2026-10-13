import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReabastecerEstoque } from './reabastecer-estoque';

describe('ReabastecerEstoque', () => {
  let component: ReabastecerEstoque;
  let fixture: ComponentFixture<ReabastecerEstoque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReabastecerEstoque],
    }).compileComponents();

    fixture = TestBed.createComponent(ReabastecerEstoque);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
