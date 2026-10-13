import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostosEstoque } from './postos-estoque';

describe('PostosEstoque', () => {
  let component: PostosEstoque;
  let fixture: ComponentFixture<PostosEstoque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostosEstoque],
    }).compileComponents();

    fixture = TestBed.createComponent(PostosEstoque);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
