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
      error: () => this.openSnackbar('Error al cargar ofertas.', 'error')
    });
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe({
      next: (postulantes) => {
        this.postulantes = postulantes;
      },
      error: () => this.openSnackbar('Error al cargar postulantes.', 'error')
    });
  }

  obtenerEmpresaId(): void {
    if (!this.username) {
      this.openSnackbar('No hay usuario logeado', 'warning');
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
            this.openSnackbar('Empresa no encontrada', 'warning');
          }
        });
      } else {
        this.openSnackbar('Usuario no encontrado', 'warning');
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
            this.openSnackbar('Error al cargar los posts.', 'error');
            this.loading = false;
          }
        });
      },
      error: () => {
        this.openSnackbar('Error al cargar las ofertas.', 'error');
        this.loading = false;
      }
    });
  }

  responderPost(post: Post): void {
    if (!post.disponible) {
      this.openSnackbar('Este post ya ha sido respondido.', 'warning');
      return;
    }

    this.loading = true;
    post.disponible = false;
    this.postService.actualizarPost(post).subscribe({
      next: () => {
        this.openSnackbar('Respuesta enviada exitosamente.', 'success');
        this.postsRecibidos = this.postsRecibidos.filter((p) => p.id !== post.id); 
        this.loading = false;
      },
      error: () => {
        this.openSnackbar('Error al enviar la respuesta.', 'error');
        this.loading = false;
      },
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
