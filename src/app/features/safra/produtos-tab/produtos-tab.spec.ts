import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProdutosTab } from './produtos-tab';

describe('ProdutosTab', () => {
  let component: ProdutosTab;
  let fixture: ComponentFixture<ProdutosTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosTab],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdutosTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
