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
    console.log('Username obtenido del AuthService:', this.username);
  }

  ngOnInit(): void {
    this.cargarPostulantes();
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe({
      next: (postulantes) => {
        console.log('Postulantes obtenidos:', postulantes);
        this.obtenerPostulanteId(postulantes);
      },
      error: (err) => {
        console.error('Error al cargar postulantes:', err);
        this.snackBar.open('Error al cargar postulantes.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  obtenerPostulanteId(postulantes: any[]): void {
    if (!this.username) {
      console.warn('No se obtuvo un username válido.');
      this.snackBar.open('No hay usuario logeado', 'Cerrar', { duration: 3000 });
      return;
    }

    this.usuarioService.listarTodos().subscribe({
      next: (usuarios) => {
        console.log('Usuarios obtenidos:', usuarios);
        const usuarioLogueado = usuarios.find(u => u.username === this.username);
        console.log('Usuario logueado encontrado:', usuarioLogueado);

        if (usuarioLogueado) {
          const postulanteLogueado = postulantes.find(p => p.usuarioId === usuarioLogueado.id);
          console.log('Postulante logueado encontrado:', postulanteLogueado);

          if (postulanteLogueado) {
            this.postulanteId = postulanteLogueado.id;
            console.log('Postulante ID:', this.postulanteId);
            this.cargarPostsRespondidos(this.postulanteId);
          } else {
            console.warn('Postulante asociado al usuario no encontrado.');
            this.snackBar.open('Postulante no encontrado', 'Cerrar', { duration: 3000 });
          }
        } else {
          console.warn('Usuario no encontrado.');
          this.snackBar.open('Usuario no encontrado', 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.snackBar.open('Error al cargar usuarios.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarPostsRespondidos(postulanteId: number): void {
    this.loading = true;
    console.log('Cargando posts respondidos para el postulante ID:', postulanteId);

    this.postService.listarRespondidosPorPostulanteId(postulanteId).subscribe({
      next: (posts) => {
        console.log('Posts respondidos obtenidos:', posts);
        this.posts = posts;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar posts respondidos:', err);
        this.loading = false;
        this.snackBar.open('Error al cargar los posts respondidos.', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
