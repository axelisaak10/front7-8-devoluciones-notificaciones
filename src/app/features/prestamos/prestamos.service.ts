import { Injectable, computed, signal } from '@angular/core';

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';
export type EstadoPrestamo = 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';

export interface UsuarioBiblioteca {
  id: string;
  nombre: string;
  matricula: string;
  correo: string;
  estado: EstadoUsuario;
  sancionesPendientes: number;
}

export interface LibroCatalogo {
  id: string;
  titulo: string;
  autor: string;
  ejemplaresDisponibles: number;
}

export interface Prestamo {
  id: string;
  usuarioId: string;
  libroId: string;
  fechaPrestamo: string;
  fechaVencimiento: string;
  fechaDevolucion: string | null;
  estado: EstadoPrestamo;
}

export interface PrestamoDetallado extends Prestamo {
  usuario: UsuarioBiblioteca;
  libro: LibroCatalogo;
}

export interface FiltroHistorial {
  usuarioId?: string;
  desde?: string;
  hasta?: string;
}

export interface ResultadoRegistro {
  ok: boolean;
  mensaje: string;
  prestamo?: Prestamo;
}

const DIA_MS = 24 * 60 * 60 * 1000;

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function sumarDias(fechaIso: string, dias: number): string {
  return new Date(new Date(fechaIso).getTime() + dias * DIA_MS).toISOString().slice(0, 10);
}

/**
 * PR01-PR03 (EPIC05): administración de préstamos, solo front-end.
 * Los datos viven en memoria mediante signals; no hay backend todavía.
 */
@Injectable({ providedIn: 'root' })
export class PrestamosService {
  private readonly _usuarios = signal<UsuarioBiblioteca[]>([
    { id: 'u1', nombre: 'Ana López Ramírez', matricula: '21DS045', correo: 'ana.lopez@uteq.edu.mx', estado: 'ACTIVO', sancionesPendientes: 0 },
    { id: 'u2', nombre: 'Carlos Medina Ortiz', matricula: '20IS012', correo: 'carlos.medina@uteq.edu.mx', estado: 'ACTIVO', sancionesPendientes: 0 },
    { id: 'u3', nombre: 'Diana Torres Vega', matricula: '22RT033', correo: 'diana.torres@uteq.edu.mx', estado: 'ACTIVO', sancionesPendientes: 1 },
    { id: 'u4', nombre: 'Emilio Salas Cruz', matricula: '19DS098', correo: 'emilio.salas@uteq.edu.mx', estado: 'INACTIVO', sancionesPendientes: 0 },
  ]);

  private readonly _libros = signal<LibroCatalogo[]>([
    { id: 'l1', titulo: 'Ingeniería de Software: Un Enfoque Práctico', autor: 'Roger S. Pressman', ejemplaresDisponibles: 2 },
    { id: 'l2', titulo: 'Redes de Computadoras', autor: 'Andrew S. Tanenbaum', ejemplaresDisponibles: 1 },
    { id: 'l3', titulo: 'Cálculo de Varias Variables', autor: 'James Stewart', ejemplaresDisponibles: 0 },
    { id: 'l4', titulo: 'Clean Code', autor: 'Robert C. Martin', ejemplaresDisponibles: 3 },
    { id: 'l5', titulo: 'Fundamentos de Bases de Datos', autor: 'Abraham Silberschatz', ejemplaresDisponibles: 2 },
  ]);

  private readonly _prestamos = signal<Prestamo[]>([
    {
      id: 'p1',
      usuarioId: 'u1',
      libroId: 'l1',
      fechaPrestamo: sumarDias(hoyIso(), -10),
      fechaVencimiento: sumarDias(hoyIso(), 4),
      fechaDevolucion: null,
      estado: 'ACTIVO',
    },
    {
      id: 'p2',
      usuarioId: 'u2',
      libroId: 'l5',
      fechaPrestamo: sumarDias(hoyIso(), -20),
      fechaVencimiento: sumarDias(hoyIso(), -6),
      fechaDevolucion: sumarDias(hoyIso(), -7),
      estado: 'DEVUELTO',
    },
    {
      id: 'p3',
      usuarioId: 'u1',
      libroId: 'l2',
      fechaPrestamo: sumarDias(hoyIso(), -30),
      fechaVencimiento: sumarDias(hoyIso(), -16),
      fechaDevolucion: null,
      estado: 'VENCIDO',
    },
  ]);

  readonly usuarios = this._usuarios.asReadonly();
  readonly libros = this._libros.asReadonly();
  readonly prestamos = this._prestamos.asReadonly();

  readonly historialDetallado = computed<PrestamoDetallado[]>(() =>
    this._prestamos()
      .map((prestamo) => this.detallar(prestamo))
      .filter((prestamo): prestamo is PrestamoDetallado => prestamo !== null)
      .sort((a, b) => b.fechaPrestamo.localeCompare(a.fechaPrestamo)),
  );

  buscarUsuarios(termino: string): UsuarioBiblioteca[] {
    const valor = termino.trim().toLowerCase();
    if (!valor) {
      return this._usuarios();
    }
    return this._usuarios().filter(
      (usuario) =>
        usuario.nombre.toLowerCase().includes(valor) ||
        usuario.matricula.toLowerCase().includes(valor),
    );
  }

  buscarLibros(termino: string): LibroCatalogo[] {
    const valor = termino.trim().toLowerCase();
    if (!valor) {
      return this._libros();
    }
    return this._libros().filter(
      (libro) =>
        libro.titulo.toLowerCase().includes(valor) || libro.autor.toLowerCase().includes(valor),
    );
  }

  /** PR01 — Registra un préstamo solo si el usuario está ACTIVO, sin sanciones y hay ejemplares disponibles. */
  registrarPrestamo(usuarioId: string, libroId: string, diasPlazo = 7): ResultadoRegistro {
    const usuario = this._usuarios().find((u) => u.id === usuarioId);
    const libro = this._libros().find((l) => l.id === libroId);

    if (!usuario) {
      return { ok: false, mensaje: 'Selecciona un usuario válido.' };
    }
    if (!libro) {
      return { ok: false, mensaje: 'Selecciona un libro válido.' };
    }
    if (usuario.estado !== 'ACTIVO') {
      return { ok: false, mensaje: `${usuario.nombre} no tiene una cuenta ACTIVA.` };
    }
    if (usuario.sancionesPendientes > 0) {
      return { ok: false, mensaje: `${usuario.nombre} tiene sanciones pendientes por resolver.` };
    }
    if (libro.ejemplaresDisponibles <= 0) {
      return { ok: false, mensaje: `No hay ejemplares disponibles de "${libro.titulo}".` };
    }

    const fechaPrestamo = hoyIso();
    const prestamo: Prestamo = {
      id: `p${crypto.randomUUID()}`,
      usuarioId,
      libroId,
      fechaPrestamo,
      fechaVencimiento: sumarDias(fechaPrestamo, diasPlazo),
      fechaDevolucion: null,
      estado: 'ACTIVO',
    };

    this._prestamos.update((lista) => [prestamo, ...lista]);
    this._libros.update((lista) =>
      lista.map((l) => (l.id === libroId ? { ...l, ejemplaresDisponibles: l.ejemplaresDisponibles - 1 } : l)),
    );

    return { ok: true, mensaje: `Préstamo registrado para ${usuario.nombre}.`, prestamo };
  }

  /** PR02 — Préstamos con estado ACTIVO de un usuario específico. */
  prestamosActivosDeUsuario(usuarioId: string): PrestamoDetallado[] {
    return this.historialDetallado().filter(
      (prestamo) => prestamo.usuarioId === usuarioId && prestamo.estado === 'ACTIVO',
    );
  }

  /** PR03 — Historial completo con filtro opcional por usuario y/o rango de fechas. */
  historialFiltrado(filtro: FiltroHistorial): PrestamoDetallado[] {
    return this.historialDetallado().filter((prestamo) => {
      if (filtro.usuarioId && prestamo.usuarioId !== filtro.usuarioId) {
        return false;
      }
      if (filtro.desde && prestamo.fechaPrestamo < filtro.desde) {
        return false;
      }
      if (filtro.hasta && prestamo.fechaPrestamo > filtro.hasta) {
        return false;
      }
      return true;
    });
  }

  private detallar(prestamo: Prestamo): PrestamoDetallado | null {
    const usuario = this._usuarios().find((u) => u.id === prestamo.usuarioId);
    const libro = this._libros().find((l) => l.id === prestamo.libroId);
    if (!usuario || !libro) {
      return null;
    }
    return { ...prestamo, usuario, libro };
  }
}
