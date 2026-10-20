import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaContaFornecedor } from './nova-conta-fornecedor';

describe('NovaContaFornecedor', () => {
  let component: NovaContaFornecedor;
  let fixture: ComponentFixture<NovaContaFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaContaFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaContaFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
