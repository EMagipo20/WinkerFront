import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post';
import { PostulanteService } from '../../services/postulante.service';
import { OfertaEmpleoService } from '../../services/ofertaEmpleo.service';
import { UsuarioService } from '../../services/usuario.service';
import { EmpresaService } from '../../services/empresa.service';
import { AuthService } from '../../services/auth.service';
import { OfertaEmpleo } from '../../models/ofertaEmpleo';
import { forkJoin } from 'rxjs';
import { Postulante } from '../../models/postulante';

@Component({
  selector: 'app-responderpost',
  templateUrl:'./responderpost.component.html',
  styleUrls: ['./responderpost.component.scss']
})
export class ResponderPostComponent implements OnInit {
  postsRecibidos: Post[] = [];
  postulantes: Postulante[] = [];
  ofertas: OfertaEmpleo[] = [];
  username: string = '';
  empresaId: number = 0;
  loading = false;

  constructor(
    private postService: PostService,
    private ofertaService: OfertaEmpleoService,
    private postulanteService: PostulanteService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
    private snackBar: MatSnackBar
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.cargarOfertas();
    this.cargarPostulantes();
  }

  cargarOfertas(): void {
    this.ofertaService.listarOfertas().subscribe({
      next: (ofertas) => {
        this.ofertas = ofertas;
        this.obtenerEmpresaId();
      },
      error: () => this.snackBar.open('Error al cargar ofertas.', 'Cerrar', { duration: 3000 })
    });
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe({
      next: (postulantes) => {
        this.postulantes = postulantes;
      },
      error: () => this.snackBar.open('Error al cargar postulantes.', 'Cerrar', { duration: 3000 })
    });
  }

  obtenerEmpresaId(): void {
    if (!this.username) {
      this.snackBar.open('No hay usuario logeado', 'Cerrar', { duration: 3000 });
      return;
    }
    this.usuarioService.listarTodos().subscribe(usuarios => {
      const usuarioLogueado = usuarios.find(u => u.username === this.username);

      if (usuarioLogueado) {
        this.empresaService.EmpresaPorUsuarioId(usuarioLogueado.id).subscribe(empresa => {
          if (empresa) {
            this.empresaId = empresa.id;
            this.cargarPosts();
          } else {
            this.snackBar.open('Empresa no encontrada', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.snackBar.open('Usuario no encontrado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarPosts(): void {
    this.loading = true;
    this.ofertaService.listarOfertaEmpleoPorEmpresa(this.empresaId).subscribe({
      next: (ofertas) => {
        this.ofertas = ofertas;
        const postObservables = this.ofertas.map(oferta => this.postService.listarPostsPorOfertaEmpleo(oferta.id));
        
        forkJoin(postObservables).subscribe({
          next: (responses) => {
            this.postsRecibidos = responses.flat().filter((post) => post.disponible).map(post => ({
              ...post,
              tituloTrabajo: this.ofertas.find(o => o.id === post.ofertaEmpleoId)?.tituloTrabajo || 'No asignado',
              nombreCompleto: this.postulantes.find(p => p.id === post.postulanteId)?.nombreCompleto || 'No asignado'
            }));
            this.loading = false;
          },
          error: () => {
            this.snackBar.open('Error al cargar los posts.', 'Cerrar', { duration: 3000 });
            this.loading = false;
          }
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar las ofertas.', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  responderPost(post: Post): void {
    if (!post.disponible) {
      this.snackBar.open('Este post ya ha sido respondido.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;
    post.disponible = false;
    this.postService.actualizarPost(post).subscribe({
      next: () => {
        this.snackBar.open('Respuesta enviada exitosamente.', 'Cerrar', { duration: 3000 });
        this.postsRecibidos = this.postsRecibidos.filter((p) => p.id !== post.id); 
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al enviar la respuesta.', 'Cerrar', { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
