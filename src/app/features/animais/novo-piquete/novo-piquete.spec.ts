import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoPiquete } from './novo-piquete';

describe('NovoPiquete', () => {
  let component: NovoPiquete;
  let fixture: ComponentFixture<NovoPiquete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoPiquete],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoPiquete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
