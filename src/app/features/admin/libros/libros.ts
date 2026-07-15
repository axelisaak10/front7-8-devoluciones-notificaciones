import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  disponible: boolean;
}

interface LibroForm {
  titulo: string;
  autor: string;
  categoria: string;
  disponible: boolean;
}

@Component({
  selector: 'app-libros-admin',
  imports: [FormsModule],
  templateUrl: './libros.html',
  styleUrl: './libros.scss',
})
export class LibrosAdmin {
  protected readonly libros = signal<Libro[]>([
    { id: 1, titulo: 'Clean Code', autor: 'Robert C. Martin', categoria: 'Software', disponible: true },
    { id: 2, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', categoria: 'Literatura', disponible: false },
    { id: 3, titulo: 'Sapiens', autor: 'Yuval Noah Harari', categoria: 'Historia', disponible: true },
  ]);

  protected readonly modo = signal<'lista' | 'form'>('lista');
  protected readonly libroSeleccionado = signal<Libro | null>(null);

  protected formulario: LibroForm = {
    titulo: '',
    autor: '',
    categoria: '',
    disponible: true,
  };

  protected abrirFormulario(nuevo: boolean = false): void {
    if (nuevo) {
      this.libroSeleccionado.set(null);
      this.formulario = { titulo: '', autor: '', categoria: '', disponible: true };
    }

    this.modo.set('form');
  }

  protected editarLibro(libro: Libro): void {
    this.libroSeleccionado.set(libro);
    this.formulario = {
      titulo: libro.titulo,
      autor: libro.autor,
      categoria: libro.categoria,
      disponible: libro.disponible,
    };
    this.modo.set('form');
  }

  protected guardarLibro(): void {
    const { titulo, autor, categoria, disponible } = this.formulario;

    if (!titulo.trim() || !autor.trim() || !categoria.trim()) {
      return;
    }

    const actual = this.libroSeleccionado();

    if (actual) {
      this.libros.update((items) =>
        items.map((libro) =>
          libro.id === actual.id ? { ...libro, titulo, autor, categoria, disponible } : libro,
        ),
      );
    } else {
      const nuevoLibro: Libro = {
        id: Date.now(),
        titulo,
        autor,
        categoria,
        disponible,
      };
      this.libros.update((items) => [nuevoLibro, ...items]);
    }

    this.volverALista();
  }

  protected eliminarLibro(id: number): void {
    this.libros.update((items) => items.filter((libro) => libro.id !== id));
  }

  protected volverALista(): void {
    this.libroSeleccionado.set(null);
    this.modo.set('lista');
  }
}
