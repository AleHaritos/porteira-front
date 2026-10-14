import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaConsulta } from './nova-consulta';

describe('NovaConsulta', () => {
  let component: NovaConsulta;
  let fixture: ComponentFixture<NovaConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaConsulta],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaConsulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
