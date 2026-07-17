import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogoService, Libro, LibroForm } from '../../../services/catalogo.service';
import { Sidebar } from '../../../components/layouts/sidebar/sidebar';
import { PanelHeader } from '../../../components/layouts/panel-header/panel-header';
import { PanelFooter } from '../../../components/layouts/panel-footer/panel-footer';

@Component({
  selector: 'app-libros-admin',
  imports: [FormsModule, Sidebar, PanelHeader, PanelFooter],
  templateUrl: './libros.html',
  styleUrl: './libros.scss',
})
export class LibrosAdmin {
  private readonly catalogoService = inject(CatalogoService);

  protected readonly menuAbierto = signal(false);
  protected readonly libros = signal<Libro[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly modo = signal<'lista' | 'form'>('lista');
  protected readonly libroSeleccionado = signal<Libro | null>(null);

  protected formulario: LibroForm = {
    titulo: '',
    isbn: '',
    autor: '',
    categoria: '',
    stock: 1,
    portadaUrl: '',
  };

  constructor() {
    this.cargarLibros();
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected disponible(libro: Libro): boolean {
    return libro.activo && libro.stock - libro.stockReservado > 0;
  }

  protected abrirFormulario(nuevo: boolean = false): void {
    if (nuevo) {
      this.libroSeleccionado.set(null);
      this.formulario = { titulo: '', isbn: '', autor: '', categoria: '', stock: 1, portadaUrl: '' };
    }

    this.error.set(null);
    this.modo.set('form');
  }

  protected editarLibro(libro: Libro): void {
    this.libroSeleccionado.set(libro);
    this.formulario = {
      titulo: libro.titulo,
      isbn: libro.isbn,
      autor: libro.autor,
      categoria: libro.categoria,
      stock: libro.stock,
      portadaUrl: libro.portadaUrl ?? '',
    };
    this.error.set(null);
    this.modo.set('form');
  }

  protected guardarLibro(): void {
    const { titulo, isbn, autor, categoria, stock, portadaUrl } = this.formulario;

    if (!titulo.trim() || !isbn.trim() || !autor.trim() || !categoria.trim()) {
      return;
    }

    const actual = this.libroSeleccionado();
    const payload: LibroForm = {
      titulo,
      isbn,
      autor,
      categoria,
      stock,
      portadaUrl: portadaUrl?.trim() || null,
    };

    const peticion = actual
      ? this.catalogoService.actualizar(actual.id, payload)
      : this.catalogoService.crear(payload);

    peticion.subscribe({
      next: () => {
        this.cargarLibros();
        this.volverALista();
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'No se pudo guardar el libro.');
      },
    });
  }

  protected eliminarLibro(id: string): void {
    this.catalogoService.eliminar(id).subscribe({
      next: () => this.libros.update((items) => items.filter((libro) => libro.id !== id)),
      error: () => this.error.set('No se pudo eliminar el libro.'),
    });
  }

  protected volverALista(): void {
    this.libroSeleccionado.set(null);
    this.modo.set('lista');
  }

  private cargarLibros(): void {
    this.cargando.set(true);
    this.catalogoService.listar().subscribe({
      next: (libros) => {
        this.libros.set(libros);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo.');
        this.cargando.set(false);
      },
    });
  }
}
