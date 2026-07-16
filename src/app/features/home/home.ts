import { Component, ElementRef, HostListener, afterNextRender, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { Sidebar } from '../../components/layouts/sidebar/sidebar';
import { PrestamosService } from '../prestamos/prestamos.service';

interface EnlaceNav {
  etiqueta: string;
  ruta?: string;
  fragmento?: string;
  exacto?: boolean;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterLinkActive, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly prestamosService = inject(PrestamosService);
  private readonly elementoAnfitrion = inject(ElementRef<HTMLElement>);

  protected readonly usuario = this.auth.usuario;
  protected readonly menuAbierto = signal(false);
  protected readonly menuUsuarioAbierto = signal(false);
  protected readonly navConScroll = signal(false);
  protected readonly anioActual = new Date().getFullYear();

  protected readonly enlacesNav: EnlaceNav[] = [
    { etiqueta: 'Inicio', ruta: '/home', exacto: true },
    { etiqueta: 'Catálogo', ruta: '/catalogo' },
    { etiqueta: 'Mis Préstamos', fragmento: 'mis-prestamos' },
    { etiqueta: 'Reservas', ruta: '/mis-reservas' },
    { etiqueta: 'Historial', fragmento: 'avisos' },
  ];

  constructor() {
    // Solo front-end: si no hay sesión activa, regresamos al login.
    if (!this.auth.estaAutenticado()) {
      this.router.navigateByUrl('/login');
    }

    afterNextRender(() => {
      const actualizarScroll = () => this.navConScroll.set(window.scrollY > 8);
      actualizarScroll();
      window.addEventListener('scroll', actualizarScroll, { passive: true });
    });
  }

  @HostListener('document:click', ['$event'])
  protected alClicFuera(evento: MouseEvent): void {
    if (!this.menuUsuarioAbierto()) return;
    if (!this.elementoAnfitrion.nativeElement.querySelector('.panel__chip')?.contains(evento.target as Node)) {
      this.menuUsuarioAbierto.set(false);
    }
  }

  protected alternarMenuUsuario(evento: MouseEvent): void {
    evento.stopPropagation();
    this.menuUsuarioAbierto.update((abierto) => !abierto);
  }

  protected cerrarSesion(): void {
    this.menuUsuarioAbierto.set(false);
    this.auth.cerrarSesion();
  }

  protected readonly usuarioBiblioteca = computed(() => {
    const email = this.usuario()?.correo;
    if (!email) return null;
    return this.prestamosService.usuarios().find((u) => u.correo === email) ?? null;
  });

  protected readonly notificacionesUsuario = computed(() => {
    const u = this.usuarioBiblioteca();
    if (!u) return [];
    return this.prestamosService.notificaciones().filter((n) => n.usuarioId === u.id);
  });

  protected readonly iniciales = computed(() => {
    const nombre = this.usuario()?.nombre ?? 'Invitado';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  protected readonly resumen = [
    { valor: '3', texto: 'Préstamos activos', icono: 'libro' },
    { valor: '1', texto: 'Reserva pendiente', icono: 'marcador' },
    { valor: '2', texto: 'Próximos vencimientos', icono: 'reloj' },
    { valor: '12', texto: 'Libros leídos este año', icono: 'estrella' },
  ] as const;

  protected readonly prestamos = [
    {
      titulo: 'Frankenstein',
      autor: 'Mary Shelley',
      vence: '18 de julio de 2026',
      estado: 'En curso',
    },
    {
      titulo: 'El Resplandor',
      autor: 'Stephen King',
      vence: '21 de julio de 2026',
      estado: 'En curso',
    },
    {
      titulo: 'Cumbres Borrascosas',
      autor: 'Emily Brontë',
      vence: '12 de julio de 2026',
      estado: 'Por vencer',
    },
  ];

  protected readonly recomendados = [
    { titulo: 'Coraline', autor: 'Neil Gaiman', categoria: 'Fantasía oscura' },
    { titulo: 'La Casa de los Espíritus', autor: 'Isabel Allende', categoria: 'Realismo mágico' },
    { titulo: 'Orgullo y Prejuicio', autor: 'Jane Austen', categoria: 'Romance clásico' },
    { titulo: 'Cándido', autor: 'Voltaire', categoria: 'Humor clásico' },
  ];

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }
}
