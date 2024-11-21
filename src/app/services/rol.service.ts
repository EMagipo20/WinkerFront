import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private baseUrl = `${environment.wBase}/roles`;

  constructor(private http: HttpClient) {}

  // Método para crear un rol
  public crearRol(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(`${this.baseUrl}/Agregar`, rol);
  }
}
