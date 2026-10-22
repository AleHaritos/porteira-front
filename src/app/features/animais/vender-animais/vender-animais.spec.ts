import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VenderAnimais } from './vender-animais';

describe('VenderAnimais', () => {
  let component: VenderAnimais;
  let fixture: ComponentFixture<VenderAnimais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenderAnimais],
    }).compileComponents();

    fixture = TestBed.createComponent(VenderAnimais);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
