import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustoSafraCard } from './custo-safra-card';

describe('CustoSafraCard', () => {
  let component: CustoSafraCard;
  let fixture: ComponentFixture<CustoSafraCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustoSafraCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CustoSafraCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
