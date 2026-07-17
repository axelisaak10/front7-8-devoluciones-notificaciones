import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RolUsuario } from './usuarios-admin';

export interface PerfilUsuario {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: RolUsuario;
  fechaRegistro: string;
  activo: boolean;
}

export interface PerfilUpdateRequest {
  nombreCompleto: string;
  email: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/api/profile';

  obtener(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(this.url);
  }

  actualizar(request: PerfilUpdateRequest): Observable<PerfilUsuario> {
    return this.http.put<PerfilUsuario>(this.url, request);
  }
}
