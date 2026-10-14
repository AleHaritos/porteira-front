import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FluxoSafraCard } from './fluxo-safra-card';

describe('FluxoSafraCard', () => {
  let component: FluxoSafraCard;
  let fixture: ComponentFixture<FluxoSafraCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FluxoSafraCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FluxoSafraCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
