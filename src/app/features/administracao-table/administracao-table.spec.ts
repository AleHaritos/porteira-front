import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministracaoTable } from './administracao-table';

describe('AdministracaoTable', () => {
  let component: AdministracaoTable;
  let fixture: ComponentFixture<AdministracaoTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracaoTable],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracaoTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
