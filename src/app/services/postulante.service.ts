import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { Postulante } from '../models/postulante';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostulanteService {
  private baseUrl = `${environment.wBase}/Postulantes`;

  constructor(private http: HttpClient) {}
  // Método para registrar
  registrar(postulante: Postulante): Observable<Postulante> {
    return this.http.post<Postulante>(`${this.baseUrl}/Agregar`, postulante);
  }

  // Método para actualizar
  actualizar(postulante: Postulante): Observable<Postulante> {
    return this.http.put<Postulante>(`${this.baseUrl}/Actualizar`, postulante);
  }

  // Método para listar todos los postulantes
  listarPostulantes(): Observable<Postulante[]> {
    return this.http.get<Postulante[]>(`${this.baseUrl}/ListarTodo`);
  }

  // Método para eliminar un postulante por ID
  eliminarPostulante(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Eliminar/${id}`);
  }

  // Método para obtener un postulante por ID
  obtenerPostulantePorId(id: number): Observable<Postulante> {
    return this.http.get<Postulante>(`${this.baseUrl}/Obtener/${id}`);
  }

  // Método para buscar postulantes por nombre
  buscarPostulantePorNombre(nombreCompleto: string): Observable<Postulante[]> {
    return this.http.get<Postulante[]>(`${this.baseUrl}/BuscarPorNombre/${nombreCompleto}`);
  }

  // Método para buscar postulantes por correo
  buscarPostulantePorCorreo(correo: string): Observable<Postulante[]> {
    return this.http.get<Postulante[]>(`${this.baseUrl}/BuscarPorCorreo/${correo}`);
  }

  // Método para obtener postulantes con solicitudes aceptadas
  postulantesConSolicitudesAceptadas(): Observable<Postulante[]> {
    return this.http.get<Postulante[]>(`${this.baseUrl}/SolicitudesAceptadas`);
  }

  // Método para obtener el postulanteId por username
  getPostulanteIdByUsername(username: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/obtenerId/${username}`);
  }

  // Método para contar posts por postulante
  countPostsPorPostulante(): Observable<Object[]> {
    return this.http.get<Object[]>(`${this.baseUrl}/count-posts`);
  }

  // Método para obtener al postulante por usuarioId
  PostulantePorUsuarioId(usuarioId: number): Observable<Postulante> {
    return this.http.get<Postulante>(`${this.baseUrl}/usuario/${usuarioId}`);
  }
}