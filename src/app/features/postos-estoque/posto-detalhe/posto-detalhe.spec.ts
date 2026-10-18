import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostoDetalhe } from './posto-detalhe';

describe('PostoDetalhe', () => {
  let component: PostoDetalhe;
  let fixture: ComponentFixture<PostoDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostoDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(PostoDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
