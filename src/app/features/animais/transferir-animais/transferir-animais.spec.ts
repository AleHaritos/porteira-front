import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransferirAnimais } from './transferir-animais';

describe('TransferirAnimais', () => {
  let component: TransferirAnimais;
  let fixture: ComponentFixture<TransferirAnimais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferirAnimais],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferirAnimais);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
