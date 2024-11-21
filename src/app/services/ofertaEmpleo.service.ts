import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OfertaEmpleo } from '../models/ofertaEmpleo';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class OfertaEmpleoService {
   private baseUrl = `${environment.wBase}/OfertasEmpleo`;

   constructor(private http: HttpClient) {}

   agregarOferta(oferta: OfertaEmpleo): Observable<OfertaEmpleo> {
      return this.http.post<OfertaEmpleo>(`${this.baseUrl}/Agregar`, oferta);
   }
    
   actualizarOferta(oferta: OfertaEmpleo): Observable<OfertaEmpleo> {
      return this.http.put<OfertaEmpleo>(`${this.baseUrl}/Actualizar`, oferta);
   }
    
   eliminarOferta(id: number): Observable<string> {
      return this.http.delete<string>(`${this.baseUrl}/Eliminar/${id}`);
   }
    
   listarOfertas(): Observable<OfertaEmpleo[]> {
      return this.http.get<OfertaEmpleo[]>(`${this.baseUrl}/ListarTodo`);
   }
    
   listarOfertaEmpleoPorEmpresa(empresaId: number): Observable<OfertaEmpleo[]> {
      return this.http.get<OfertaEmpleo[]>(`${this.baseUrl}/listarPorEmpresa/${empresaId}`);
   }

   buscarOfertasPorTitulo(titulo: string): Observable<OfertaEmpleo[]> {
      return this.http.get<OfertaEmpleo[]>(`${this.baseUrl}/BuscarPorTitulo/${titulo}`);
   }
    
   obtenerMejoresSalarios(): Observable<OfertaEmpleo[]> {
      return this.http.get<OfertaEmpleo[]>(`${this.baseUrl}/MejoresSalarios`);
   }
    
   contarOfertasPorMesYAno(mes: number, ano: number): Observable<number> {
      const params = new HttpParams()
        .set('mes', mes.toString())
        .set('ano', ano.toString());
      return this.http.get<number>(`${this.baseUrl}/ContarPorMesYAno`, { params });
   }

   contarPorEmpresaId(empresaId: number): Observable<number> {
      return this.http.get<number>(`${this.baseUrl}/contar/${empresaId}`);
   }
  
   OfertasActivas(): Observable<OfertaEmpleo[]> {
      return this.http.get<OfertaEmpleo[]>(`${this.baseUrl}/activo`);
   }
}
