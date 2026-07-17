import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PanelHeader } from '../../components/layouts/panel-header/panel-header';
import { Sidebar } from '../../components/layouts/sidebar/sidebar';
import { PanelFooter } from '../../components/layouts/panel-footer/panel-footer';
import { Auth } from '../../services/auth';
import { PerfilService, PerfilUpdateRequest } from '../../services/perfil';

@Component({
  selector: 'app-perfil',
  imports: [FormsModule, PanelHeader, Sidebar, PanelFooter],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly auth = inject(Auth);

  protected readonly menuAbierto = signal(false);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');
  protected formulario: PerfilUpdateRequest = { nombreCompleto: '', email: '', password: '' };
  protected confirmarPassword = '';

  async ngOnInit(): Promise<void> {
    try {
      const perfil = await firstValueFrom(this.perfilService.obtener());
      this.formulario = { nombreCompleto: perfil.nombreCompleto, email: perfil.email, password: '' };
    } catch (error) { this.error.set(this.mensajeError(error)); }
    finally { this.cargando.set(false); }
  }

  protected async guardar(): Promise<void> {
    if (this.guardando()) return;
    this.error.set(''); this.exito.set('');
    const request = { ...this.formulario };
    if (!request.nombreCompleto.trim() || !request.email.trim()) {
      this.error.set('El nombre y el correo son obligatorios.'); return;
    }
    if (request.password && request.password.length < 8) {
      this.error.set('La contrasena debe tener al menos 8 caracteres.'); return;
    }
    if (request.password !== this.confirmarPassword) {
      this.error.set('Las contrasenas no coinciden.'); return;
    }
    if (!request.password) delete request.password;
    this.guardando.set(true);
    try {
      const perfil = await firstValueFrom(this.perfilService.actualizar(request));
      this.auth.actualizarUsuario(perfil.nombreCompleto, perfil.email);
      this.formulario = { nombreCompleto: perfil.nombreCompleto, email: perfil.email, password: '' };
      this.confirmarPassword = '';
      this.exito.set('Perfil actualizado correctamente.');
    } catch (error) { this.error.set(this.mensajeError(error)); }
    finally { this.guardando.set(false); }
  }

  protected alternarMenu(): void { this.menuAbierto.update((abierto) => !abierto); }

  private mensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return String(error.error?.error ?? 'No fue posible actualizar el perfil.');
    }
    return 'No fue posible actualizar el perfil.';
  }
}
