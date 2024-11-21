import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl = `${environment.wBase}/Posts`;

  constructor(private http: HttpClient) {}

  // Método para agregar un post
  agregarPost(post: Post): Observable<Post> {
    return this.http.post<Post>(`${this.baseUrl}/Agregar`, post);
  }

  // Método para actualizar un post
  actualizarPost(post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/Actualizar`, post);
  }

  // Método para eliminar un post por ID
  eliminarPost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Eliminar/${id}`);
  }

  // Método para listar todos los posts
  listarPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/ListarTodo`);
  }

  // Método para listar posts por oferta id
  listarPostsPorOfertaEmpleo(ofertaEmpleoId: number) {
    return this.http.get<Post[]>(`${this.baseUrl}/listarPostsPorOfertaEmpleo/${ofertaEmpleoId}`);
  }

  // Método para listar posts por oferta id
  listarPostsPorOferta(ofertaEmpleoId: number) {
    return this.http.get<Post[]>(`${this.baseUrl}/listarPostsOferta/${ofertaEmpleoId}`);
  }

  // Método para contar posts por oferta de empleo
  countPostsPorOfertaEmpleo(): Observable<Object[]> {
    return this.http.get<Object[]>(`${this.baseUrl}/count-por-oferta-empleo`);
  }

  // Obtener posts sin respuesta
  obtenerPostsSinResponder(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/sin-responder`);
  }
}