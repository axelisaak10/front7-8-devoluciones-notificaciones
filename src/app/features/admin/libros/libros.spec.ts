import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibrosAdmin } from './libros';

describe('LibrosAdmin', () => {
  let component: LibrosAdmin;
  let fixture: ComponentFixture<LibrosAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibrosAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(LibrosAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe mostrar el título de inventario de libros', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Inventario de libros');
  });
});
