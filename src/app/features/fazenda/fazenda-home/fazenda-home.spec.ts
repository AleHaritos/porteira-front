import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FazendaHome } from './fazenda-home';

describe('FazendaHome', () => {
  let component: FazendaHome;
  let fixture: ComponentFixture<FazendaHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FazendaHome],
    }).compileComponents();

    fixture = TestBed.createComponent(FazendaHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
