import { Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-prestamos-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './prestamos-sidebar.html',
  styleUrl: './prestamos-sidebar.scss',
})
export class PrestamosSidebar {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly abierto = input(false);
  readonly cerrar = output<void>();

  protected readonly usuario = this.auth.usuario;

  protected readonly iniciales = computed(() => {
    const nombre = this.usuario()?.nombre ?? 'Bibliotecario';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  cerrarSesion(): void {
    this.cerrar.emit();
    this.auth.cerrarSesion();
    this.router.navigateByUrl('/');
  }
}
