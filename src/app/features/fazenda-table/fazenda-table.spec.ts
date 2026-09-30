import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FazendaTable } from './fazenda-table';

describe('FazendaTable', () => {
  let component: FazendaTable;
  let fixture: ComponentFixture<FazendaTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FazendaTable],
    }).compileComponents();

    fixture = TestBed.createComponent(FazendaTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
