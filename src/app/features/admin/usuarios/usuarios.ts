import { Component, OnInit, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  RolUsuario, UsuarioAdmin, UsuarioAdminRequest, UsuariosAdminService,
} from '../../../services/usuarios-admin';

@Component({
  selector: 'app-usuarios-admin',
  imports: [FormsModule, SlicePipe],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosAdminComponent implements OnInit {
  private readonly service = inject(UsuariosAdminService);
  protected readonly usuarios = signal<UsuarioAdmin[]>([]);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');
  protected readonly editando = signal<UsuarioAdmin | null>(null);
  protected readonly formularioVisible = signal(false);
  protected readonly roles: RolUsuario[] = ['ESTUDIANTE', 'INSTRUCTOR', 'ADMINISTRADOR'];
  protected formulario: UsuarioAdminRequest = this.formularioVacio();

  async ngOnInit(): Promise<void> { await this.cargar(); }

  protected nuevo(): void {
    this.editando.set(null);
    this.formulario = this.formularioVacio();
    this.limpiarMensajes();
    this.formularioVisible.set(true);
  }

  protected editar(usuario: UsuarioAdmin): void {
    this.editando.set(usuario);
    this.formulario = {
      nombreCompleto: usuario.nombreCompleto, email: usuario.email, password: '', rol: usuario.rol,
    };
    this.limpiarMensajes();
    this.formularioVisible.set(true);
  }

  protected cancelar(): void { this.formularioVisible.set(false); this.editando.set(null); }

  protected async guardar(): Promise<void> {
    if (this.guardando()) return;
    this.limpiarMensajes();
    const request = { ...this.formulario };
    if (!request.nombreCompleto.trim() || !request.email.trim()) {
      this.error.set('Nombre y correo son obligatorios.'); return;
    }
    if (!this.editando() && (!request.password || request.password.length < 8)) {
      this.error.set('La contrasena debe tener al menos 8 caracteres.'); return;
    }
    if (this.editando() && !request.password) delete request.password;
    this.guardando.set(true);
    try {
      const actual = this.editando();
      if (actual) await firstValueFrom(this.service.actualizar(actual.id, request));
      else await firstValueFrom(this.service.crear(request));
      this.exito.set(actual ? 'Usuario actualizado.' : 'Usuario creado.');
      this.cancelar();
      await this.cargar(false);
    } catch (error) { this.error.set(this.mensajeError(error)); }
    finally { this.guardando.set(false); }
  }

  protected async desactivar(usuario: UsuarioAdmin): Promise<void> {
    if (!confirm(`¿Desactivar a ${usuario.nombreCompleto}?`)) return;
    this.limpiarMensajes();
    try {
      await firstValueFrom(this.service.cambiarEstado(usuario.id, false));
      this.exito.set('Usuario desactivado correctamente.');
      await this.cargar(false);
    } catch (error) { this.error.set(this.mensajeError(error)); }
  }

  protected async reactivar(usuario: UsuarioAdmin): Promise<void> {
    if (!confirm(`\u00bfReactivar a ${usuario.nombreCompleto}?`)) return;
    this.limpiarMensajes();
    try {
      await firstValueFrom(this.service.cambiarEstado(usuario.id, true));
      this.exito.set('Usuario reactivado correctamente.');
      await this.cargar(false);
    } catch (error) { this.error.set(this.mensajeError(error)); }
  }

  private async cargar(mostrarCarga = true): Promise<void> {
    if (mostrarCarga) this.cargando.set(true);
    try { this.usuarios.set(await firstValueFrom(this.service.listar())); }
    catch (error) { this.error.set(this.mensajeError(error)); }
    finally { this.cargando.set(false); }
  }
  private formularioVacio(): UsuarioAdminRequest {
    return { nombreCompleto: '', email: '', password: '', rol: 'ESTUDIANTE' };
  }
  private limpiarMensajes(): void { this.error.set(''); this.exito.set(''); }
  private mensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) return 'No tienes permisos de administrador.';
      return String(error.error?.error ?? 'No fue posible completar la operacion.');
    }
    return 'No fue posible completar la operacion.';
  }
}
