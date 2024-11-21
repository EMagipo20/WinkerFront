import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Empresa } from '../models/empresa';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private baseUrl = `${environment.wBase}/Empresas`;

  constructor(private http: HttpClient) {}

  // Método para agregar una empresa
  agregarEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.baseUrl}/Agregar`, empresa);
  }

  // Método para actualizar una empresa
  actualizarEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.baseUrl}/Actualizar`, empresa);
  }

  // Método para eliminar una empresa por ID
  eliminarEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Eliminar/${id}`);
  }

  // Método para listar todas las empresas
  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.baseUrl}/ListarTodo`);
  }

  // Método para obtener una empresa por ID
  obtenerEmpresaPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.baseUrl}/Obtener/${id}`);
  }

  // Método para buscar empresas por RUC
  buscarEmpresaPorRuc(ruc: string): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.baseUrl}/BuscarPorRuc/${ruc}`);
  }

  // Método para buscar empresas por nombre
  buscarEmpresaPorNombre(nombreEmpresa: string): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.baseUrl}/BuscarPorNombre/${nombreEmpresa}`);
  }

  // Método para contar el total de empresas
  contarTotalEmpresas(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/ContarTotal`);
  }

  // Método para obtener la empresa por usuarioId
  EmpresaPorUsuarioId(usuarioId: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.baseUrl}/usuario/${usuarioId}`);
  }
}
