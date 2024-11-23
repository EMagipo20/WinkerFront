import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { PostulanteService } from '../../services/postulante.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Post } from '../../models/post';

@Component({
  selector: 'app-posts-respondidos',
  templateUrl: './posts-respondidos.component.html',
  styleUrls: ['./posts-respondidos.component.scss']
})
export class PostsRespondidosComponent implements OnInit {
  posts: Post[] = [];
  username: string = '';
  postulanteId: number = 0;
  loading = false;
  displayedColumns: string[] = ['id', 'pregunta', 'respuesta', 'fechaPublicacion'];

  constructor(
    private postService: PostService,
    private postulanteService: PostulanteService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.cargarPostulantes();
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe({
      next: (postulantes) => {
        this.obtenerPostulanteId(postulantes);
      },
      error: (err) => {
        this.openSnackbar('Error al cargar postulantes.', 'error');
      }
    });
  }

  obtenerPostulanteId(postulantes: any[]): void {
    if (!this.username) {
      this.openSnackbar('No hay usuario logeado', 'warning');
      return;
    }

    this.usuarioService.listarTodos().subscribe({
      next: (usuarios) => {
        const usuarioLogueado = usuarios.find(u => u.username === this.username);

        if (usuarioLogueado) {
          const postulanteLogueado = postulantes.find(p => p.usuarioId === usuarioLogueado.id);

          if (postulanteLogueado) {
            this.postulanteId = postulanteLogueado.id;
            console.log('Postulante ID:', this.postulanteId);
            this.cargarPostsRespondidos(this.postulanteId);
          } else {
            this.openSnackbar('Postulante no encontrado', 'warning');
          }
        } else {
          this.openSnackbar('Usuario no encontrado', 'warning');
        }
      },
      error: (err) => {
        this.openSnackbar('Error al cargar usuarios.', 'error');
      }
    });
  }

  cargarPostsRespondidos(postulanteId: number): void {
    this.loading = true;
    this.postService.listarRespondidosPorPostulanteId(postulanteId).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.openSnackbar('Error al cargar los posts respondidos.', 'error');
      }
    });
  }

  private openSnackbar(message: string, type: 'success' | 'error' | 'warning'): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: 
        type === 'success' ? 'success-snackbar' : 
        type === 'error' ? 'error-snackbar' : 
        'warning-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
