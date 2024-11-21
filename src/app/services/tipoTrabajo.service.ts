import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { TipoTrabajo } from '../models/tipoTrabajo';


@Injectable({
  providedIn: 'root'
})
export class TipoTrabajoService {
  private baseUrl = `${environment.wBase}/TipoTrabajo`;

  constructor(private http: HttpClient) {}

  // Método para agregar un tipo de trabajo
  agregarTipoTrabajo(tipoTrabajo: TipoTrabajo): Observable<TipoTrabajo> {
    return this.http.post<TipoTrabajo>(`${this.baseUrl}/Agregar`, tipoTrabajo);
  }

  // Método para actualizar un tipo de trabajo
  actualizarTipoTrabajo(tipoTrabajo: TipoTrabajo): Observable<TipoTrabajo> {
    return this.http.put<TipoTrabajo>(`${this.baseUrl}/Actualizar`, tipoTrabajo);
  }

  // Método para eliminar un tipo de trabajo por ID
  eliminarTipoTrabajo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Eliminar/${id}`);
  }

  // Método para listar todos los tipos de trabajo
  listarTipoTrabajos(): Observable<TipoTrabajo[]> {
    return this.http.get<TipoTrabajo[]>(`${this.baseUrl}/ListarTodo`);
  }

  // Método para buscar tipos de trabajo por tipo
  buscarPorTipo(tipo: string): Observable<TipoTrabajo[]> {
    return this.http.get<TipoTrabajo[]>(`${this.baseUrl}/tipo?tipo=${tipo}`);
  }
}
