import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoAbastecimento } from './novo-abastecimento';

describe('NovoAbastecimento', () => {
  let component: NovoAbastecimento;
  let fixture: ComponentFixture<NovoAbastecimento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoAbastecimento],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoAbastecimento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
