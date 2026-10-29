import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarUsoEstoque } from './registrar-uso-estoque';

describe('RegistrarUsoEstoque', () => {
  let component: RegistrarUsoEstoque;
  let fixture: ComponentFixture<RegistrarUsoEstoque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarUsoEstoque],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarUsoEstoque);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
