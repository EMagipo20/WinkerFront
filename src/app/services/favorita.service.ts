import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Favorita } from '../models/favorita';

@Injectable({
  providedIn: 'root'
})
export class FavoritaService {
  private baseUrl = `${environment.wBase}/OfertasFavoritas`;
  private listaCambio = new Subject<Favorita[]>();
  constructor(private http: HttpClient) { }

  agregarFavorita(ofertaFavorita: Favorita): Observable<Favorita> {
    return this.http.post<Favorita>(`${this.baseUrl}/Agregar`, ofertaFavorita);
  }

  eliminarFavorita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Eliminar/${id}`);
  }

  contarFavoritasPorPostulante(postulanteId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/contarFavoritasPorPostulante/${postulanteId}`);
  }  

  listarTodos(): Observable<Favorita[]> {
    return this.http.get<Favorita[]>(`${this.baseUrl}/ListarTodo`);
  }

  listarFavoritasPorPostulante(postulanteId: number): Observable<Favorita[]> {
    return this.http.get<Favorita[]>(`${this.baseUrl}/listarFavoritasPorPostulante/${postulanteId}`);
  }
}
