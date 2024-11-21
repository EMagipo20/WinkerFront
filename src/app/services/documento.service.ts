import { Injectable } from '@angular/core';
import { HttpClient,  HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Documento } from '../models/documento';

@Injectable({
  providedIn: 'root'
})

export class DocumentoService {
  private baseUrl = `${environment.wBase}/Documentos`;

  constructor(private http: HttpClient) {}

  // Método para agregar un documento
  agregarDocumento(documento: Documento): Observable<Documento> {
    return this.http.post<Documento>(`${this.baseUrl}/Agregar`, documento);
  }

  // Método para actualizar un documento
  actualizarDocumento(documento: Documento): Observable<Documento> {
    return this.http.put<Documento>(`${this.baseUrl}/Actualizar`, documento);
  }

  // Método para eliminar un documento por ID
  eliminarDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Eliminar/${id}`);
  }

  // Método para listar todos los documentos
  listarDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.baseUrl}/ListarTodo`);
  }

  // Método para listar documentos por Id postulante
  listarDocumentosPorPostulante(postulanteId: number) {
    return this.http.get<Documento[]>(`${this.baseUrl}/listarPorPostulante/${postulanteId}`);
  }

  // Método para obtener documentos por año
  getDocumentosPorMesYAnio(anio: number, mes: number): Observable<Documento[]> {
    const params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());

    return this.http.get<Documento[]>(`${this.baseUrl}/por-mes-anio`, { params });
  }
}
