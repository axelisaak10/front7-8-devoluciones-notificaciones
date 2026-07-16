import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly auth = inject(Auth);

  /** Controlado desde Home mediante el botón hamburguesa. */
  readonly abierto = input(false);
  readonly cerrar = output<void>();

  protected readonly usuario = this.auth.usuario;

  protected readonly iniciales = computed(() => {
    const nombre = this.usuario()?.nombre ?? 'Invitado';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  cerrarSesion(): void {
    this.cerrar.emit();
    this.auth.cerrarSesion();
  }
}
