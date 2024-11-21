import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Rubro } from '../models/rubro';

@Injectable({
  providedIn: 'root'
})

export class RubroService {
  private baseUrl = `${environment.wBase}/Rubros`;

  constructor(private http: HttpClient) {}

  // Método para agregar un rubro
  agregarRubro(rubro: Rubro): Observable<Rubro> {
    return this.http.post<Rubro>(`${this.baseUrl}/Agregar`, rubro);
  }

  // Método para actualizar un rubro
  actualizarRubro(rubro: Rubro): Observable<Rubro> {
    return this.http.put<Rubro>(`${this.baseUrl}/Actualizar`, rubro);
  }

  // Método para eliminar un rubro por ID
  eliminarRubro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Eliminar/${id}`);
  }

  // Método para listar todos los rubros
  listarRubros(): Observable<Rubro[]> {
    return this.http.get<Rubro[]>(`${this.baseUrl}/ListarTodo`);
  }

  // Método para contar todos los rubros
  contarRubros(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/ContarRubros`);
  }

  // Método para buscar un rubro por nombre
  buscarRubroPorNombre(nombre: string): Observable<Rubro[]> {
    return this.http.get<Rubro[]>(`${this.baseUrl}/nombre`, { params: { nombre } });
  }
}