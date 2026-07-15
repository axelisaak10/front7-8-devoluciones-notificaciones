import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrestamosService } from '../prestamos.service';

@Component({
  selector: 'app-historial-prestamos',
  imports: [FormsModule],
  templateUrl: './historial-prestamos.html',
  styleUrl: './historial-prestamos.scss',
})
export class HistorialPrestamos {
  private readonly prestamosService = inject(PrestamosService);

  protected readonly usuarios = this.prestamosService.usuarios;

  protected readonly usuarioId = signal('');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');

  protected readonly historial = computed(() =>
    this.prestamosService.historialFiltrado({
      usuarioId: this.usuarioId() || undefined,
      desde: this.desde() || undefined,
      hasta: this.hasta() || undefined,
    }),
  );

  limpiarFiltros(): void {
    this.usuarioId.set('');
    this.desde.set('');
    this.hasta.set('');
  }
}
