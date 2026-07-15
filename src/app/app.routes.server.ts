import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // La portada post-sesión depende del estado del usuario: se renderiza en el cliente.
    path: 'home',
    renderMode: RenderMode.Client,
  },
  {
    // Panel del bibliotecario (EPIC05): también depende de la sesión.
    path: 'bibliotecario/prestamos',
    renderMode: RenderMode.Client,
  },
  {
    path: 'bibliotecario/prestamos/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
