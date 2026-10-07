import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoProduto } from './novo-produto';

describe('NovoProduto', () => {
  let component: NovoProduto;
  let fixture: ComponentFixture<NovoProduto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoProduto],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoProduto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
