import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColheitaTalhaoTab } from './colheita-talhao-tab';

describe('ColheitaTalhaoTab', () => {
  let component: ColheitaTalhaoTab;
  let fixture: ComponentFixture<ColheitaTalhaoTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColheitaTalhaoTab],
    }).compileComponents();

    fixture = TestBed.createComponent(ColheitaTalhaoTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
