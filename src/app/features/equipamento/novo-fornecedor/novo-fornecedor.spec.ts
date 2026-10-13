import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoFornecedor } from './novo-fornecedor';

describe('NovoFornecedor', () => {
  let component: NovoFornecedor;
  let fixture: ComponentFixture<NovoFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
