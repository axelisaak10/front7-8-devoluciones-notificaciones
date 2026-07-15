import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrestamosService } from '../prestamos.service';

@Component({
  selector: 'app-prestamos-activos',
  imports: [FormsModule],
  templateUrl: './prestamos-activos.html',
  styleUrl: './prestamos-activos.scss',
})
export class PrestamosActivos {
  private readonly prestamosService = inject(PrestamosService);

  protected readonly buscarUsuario = signal('');
  protected readonly usuarioId = signal('');

  protected readonly usuarios = computed(() => this.prestamosService.buscarUsuarios(this.buscarUsuario()));
  protected readonly usuarioSeleccionado = computed(() =>
    this.prestamosService.usuarios().find((u) => u.id === this.usuarioId()),
  );

  protected readonly prestamosActivos = computed(() =>
    this.usuarioId() ? this.prestamosService.prestamosActivosDeUsuario(this.usuarioId()) : [],
  );

  seleccionarUsuario(id: string): void {
    this.usuarioId.set(id);
  }

  limpiarSeleccion(): void {
    this.usuarioId.set('');
    this.buscarUsuario.set('');
  }
}
