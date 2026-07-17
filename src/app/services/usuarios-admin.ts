import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type RolUsuario = 'ESTUDIANTE' | 'INSTRUCTOR' | 'ADMINISTRADOR';
export interface UsuarioAdmin {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: RolUsuario;
  fechaRegistro: string;
  activo: boolean;
}
export interface UsuarioAdminRequest {
  nombreCompleto: string;
  email: string;
  password?: string;
  rol: RolUsuario;
}

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8088/api/v1/users';
  listar(): Observable<UsuarioAdmin[]> { return this.http.get<UsuarioAdmin[]>(this.url); }
  crear(request: UsuarioAdminRequest): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(this.url, request);
  }
  actualizar(id: string, request: UsuarioAdminRequest): Observable<UsuarioAdmin> {
    return this.http.put<UsuarioAdmin>(`${this.url}/${id}`, request);
  }
  eliminar(id: string): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
