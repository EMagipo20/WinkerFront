import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Solicitudes } from '../models/solicitudes';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  private baseUrl = `${environment.wBase}/Solicitudes`;

  constructor(private http: HttpClient) { }

  agregarSolicitud(solicitud: Solicitudes): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/Agregar`, solicitud);
  }

  actualizarSolicitud(solicitud: Solicitudes): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/Actualizar`, solicitud);
  }

  eliminarSolicitud(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/Eliminar/${id}`);
  }

  listarSolicitudesPorPostulante(postulanteId: number): Observable<Solicitudes[]> {
    return this.http.get<Solicitudes[]>(`${this.baseUrl}/listarSolicitudesPorPostulante/${postulanteId}`);
  }

  listarSolicitudPorId(id: number): Observable<Solicitudes[]> {
    return this.http.get<Solicitudes[]>(`${this.baseUrl}/ListarPorId/${id}`);
  }

  contarSolicitudesEnviadas(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/ContarEnviadas`);
  }

  contarSolicitudesPorPostulante(postulanteId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/ContarPorPostulante/${postulanteId}`);
  }

  listarSoliudes(): Observable<Solicitudes[]> {
    return this.http.get<Solicitudes[]>(`${this.baseUrl}/ListarTodo`);
  }

  listarSolicitudesPorOferta(ofertaEmpleoId: number): Observable<Solicitudes[]> {
    return this.http.get<Solicitudes[]>(`${this.baseUrl}/listarSolicitudesPorOfertaEmpleo/${ofertaEmpleoId}`);
  }

  solicitudesAceptadas(): Observable<Solicitudes[]> {
    return this.http.get<Solicitudes[]>(`${this.baseUrl}/Aceptadas`);
  }
}
