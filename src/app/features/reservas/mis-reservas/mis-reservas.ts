import { Component, signal } from '@angular/core';

interface Reserva {
  id: number;
  curso: string;
  fecha: string;
  estado: 'Activa' | 'Pendiente' | 'Cancelada';
  lugar: string;
}

@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.scss',
})
export class MisReservas {
  protected readonly reservas = signal<Reserva[]>([
    { id: 1, curso: 'Introducción a Angular', fecha: '14/07/2026', estado: 'Activa', lugar: 'Sala A' },
    { id: 2, curso: 'Diseño UX', fecha: '18/07/2026', estado: 'Pendiente', lugar: 'Sala B' },
    { id: 3, curso: 'Base de datos con MySQL', fecha: '10/07/2026', estado: 'Cancelada', lugar: 'Virtual' },
  ]);

  protected readonly filtro = signal<'Todos' | 'Activa' | 'Pendiente' | 'Cancelada'>('Todos');

  protected readonly reservasFiltradas = signal<Reserva[]>(this.reservas());

  protected cambiarFiltro(estado: 'Todos' | 'Activa' | 'Pendiente' | 'Cancelada'): void {
    this.filtro.set(estado);
    this.reservasFiltradas.set(
      estado === 'Todos' ? this.reservas() : this.reservas().filter((reserva) => reserva.estado === estado),
    );
  }
}
