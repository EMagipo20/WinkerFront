import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { UbicacionOferta } from '../models/ubicacionOferta';


@Injectable({
  providedIn: 'root'
})

export class UbicacionOfertaService {
  private baseUrl = `${environment.wBase}/UbicacionOferta`;

  constructor(private http: HttpClient) {}

  // Método para agregar una ubicación de oferta
  agregarUbicacion(ubicacionOferta: UbicacionOferta): Observable<UbicacionOferta> {
    return this.http.post<UbicacionOferta>(`${this.baseUrl}/Agregar`, ubicacionOferta);
  }

  // Método para actualizar una ubicación de oferta
  actualizarUbicacion(ubicacionOfertaDTO: UbicacionOferta): Observable<UbicacionOferta> {
    return this.http.put<UbicacionOferta>(`${this.baseUrl}/Actualizar`, ubicacionOfertaDTO);
  }

  // Método para eliminar una ubicación de oferta por ID
  eliminarUbicacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Eliminar/${id}`);
  }

  // Método para listar todas las ubicaciones de oferta
  listarUbicaciones(): Observable<UbicacionOferta[]> {
    return this.http.get<UbicacionOferta[]>(`${this.baseUrl}/ListarTodo`);
  }

  // Método para buscar ubicaciones por distrito
  buscarPorDistrito(distrito: string): Observable<UbicacionOferta[]> {
    return this.http.get<UbicacionOferta[]>(`${this.baseUrl}/distrito?distrito=${distrito}`);
  }

  // Método para buscar ubicaciones por departamento
  buscarPorDepartamento(departamento: string): Observable<UbicacionOferta[]> {
    return this.http.get<UbicacionOferta[]>(`${this.baseUrl}/departamento?departamento=${departamento}`);
  }

  // Método para buscar ubicaciones por dirección
  buscarPorDireccion(direccion: string): Observable<UbicacionOferta[]> {
    return this.http.get<UbicacionOferta[]>(`${this.baseUrl}/direccion?direccion=${direccion}`);
  }
}