import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Usuario } from '../models/usuario';
import { Rol } from '../models/rol';
import { RolService } from './rol.service';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = `${environment.wBase}/Usuarios`;
  private listChange = new Subject<Usuario[]>();

  constructor(private http: HttpClient, private rolService: RolService) {}

  // Método para obtener todos los usuarios
  public listarTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/ListarTodo`);
  }

  // Método para crear un nuevo usuario y su rol asociado
  public crear(usuario: Usuario, rolNombre: string): Observable<Usuario> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Usuario>(`${this.baseUrl}/Agregar`, usuario, { headers }).pipe(
      tap(createdUser => {
        const newRol = new Rol();
        newRol.rol = rolNombre;
        newRol.user = createdUser;
        this.rolService.crearRol(newRol).subscribe();
      }),
      catchError(this.handleError)
    );
  }

  // Método para manejar errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 409) {
        errorMessage = 'El nombre de usuario ya existe.';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(errorMessage);
  }

  // Metodo para busar un usuario por su username
  public getUsuarioByUsername(username: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/username/${username}`);
  }

  actualizarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/Actualizar`, usuario);
  }

  // Método para eliminar un usuario
  public eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Eliminar/${id}`);
  }

  // Emitir cambios en la lista de usuarios
  public setList(newList: Usuario[]) {
    this.listChange.next(newList);
  }

  // Observar cambios en la lista de usuarios
  public getList(): Observable<Usuario[]> {
    return this.listChange.asObservable();
  }
}