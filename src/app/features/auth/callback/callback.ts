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
      const returnUrl = sessionStorage.getItem('oauth_return_url') ?? '/home';
      sessionStorage.removeItem('oauth_return_url');
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible iniciar sesion.');
    }
  }
}
