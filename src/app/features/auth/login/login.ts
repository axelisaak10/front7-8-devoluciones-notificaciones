import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  async iniciarSesion(): Promise<void> {
    if (this.cargando()) return;
    this.error.set('');
    this.cargando.set(true);
    try {
      await this.auth.iniciarSesion(this.route.snapshot.queryParamMap.get('returnUrl') ?? undefined);
    } catch {
      this.error.set('No fue posible contactar al servidor de autenticacion.');
      this.cargando.set(false);
    }
  }
}
