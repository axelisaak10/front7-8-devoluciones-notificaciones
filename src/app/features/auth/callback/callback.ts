import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-auth-callback',
  template: `<main style="padding:3rem;text-align:center"><h1>Iniciando sesion...</h1>
    @if (error()) { <p role="alert">{{ error() }}</p> }</main>`,
})
export class AuthCallback implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  protected readonly error = signal('');

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    if (this.route.snapshot.queryParamMap.has('error') || !code || !state) {
      this.error.set('El servidor de autenticacion rechazo la solicitud.');
      return;
    }
    try {
      await this.auth.completarInicioSesion(code, state);
      const returnUrlSolicitado = sessionStorage.getItem('oauth_return_url');
      sessionStorage.removeItem('oauth_return_url');
      // Sin destino explicito (login directo, no un rebote de guard): cada rol va a su propia vista.
      const returnUrl = returnUrlSolicitado || this.vistaSegunRol();
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible iniciar sesion.');
    }
  }

  private vistaSegunRol(): string {
    if (this.auth.tieneRol('ADMINISTRADOR')) return '/admin';
    if (this.auth.tieneRol('INSTRUCTOR')) return '/bibliotecario';
    return '/home';
  }
}
