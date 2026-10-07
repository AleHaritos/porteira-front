import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustoTalhaoCard } from './custo-talhao-card';

describe('CustoTalhaoCard', () => {
  let component: CustoTalhaoCard;
  let fixture: ComponentFixture<CustoTalhaoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustoTalhaoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CustoTalhaoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
