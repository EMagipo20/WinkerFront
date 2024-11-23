import { Component, OnInit } from '@angular/core';
import { Favorita } from '../../models/favorita';
import { OfertaEmpleo } from '../../models/ofertaEmpleo';
import { OfertaEmpleoService } from '../../services/ofertaEmpleo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostulanteService } from '../../services/postulante.service';
import { FavoritaService } from '../../services/favorita.service';
import { Postulante } from '../../models/postulante';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { DeleteComponent } from '../confirme-delete/delete.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  favoritas: Favorita[] = []; // Lista de favoritas con claves foráneas
  enrichedFavoritas: any[] = []; // Lista enriquecida para mostrar datos adicionales
  ofertas: OfertaEmpleo[] = [];
  postulantes: Postulante[] = [];
  username: string = '';
  postulanteId: number = 0;
  favoriteCount: number = 0;
  loading = false;

  constructor(
    private ofertaService: OfertaEmpleoService,
    private snackBar: MatSnackBar,
    private favoritaService: FavoritaService,
    private postulanteService: PostulanteService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.cargarPostulantes();
    this.cargarOfertas();
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe((postulantes) => {
      this.postulantes = postulantes;
      this.obtenerPostulanteId();
    });
  }

  obtenerPostulanteId(): void {
    if (!this.username) {
      this.openSnackbar('No hay usuario logeado', 'warning');
      return;
    }

    this.usuarioService.listarTodos().subscribe((usuarios) => {
      const usuarioLogueado = usuarios.find((u) => u.username === this.username);

      if (usuarioLogueado) {
        const postulanteLogueado = this.postulantes.find(
          (p) => p.usuarioId === usuarioLogueado.id
        );

        if (postulanteLogueado) {
          this.postulanteId = postulanteLogueado.id;
          this.obtenerConteoFavoritas(this.postulanteId);
          this.cargarFavoritas(this.postulanteId);
        } else {
          this.openSnackbar('Postulante no encontrado', 'warning');
        }
      } else {
        this.openSnackbar('Usuario no encontrado', 'warning');
      }
    });
  }

  cargarOfertas(): void {
    this.ofertaService.listarOfertas().subscribe((ofertas) => {
      this.ofertas = ofertas;
    });
  }

  cargarFavoritas(postulanteId: number): void {
    this.loading = true;
    this.favoritaService.listarFavoritasPorPostulante(postulanteId).subscribe({
      next: (favoritas) => {
        this.favoritas = favoritas;
        this.enrichFavoritas();
        this.favoriteCount = this.favoritas.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.openSnackbar('Error al cargar favoritas.', 'error');
      },
    });
  }

  enrichFavoritas(): void {
    this.enrichedFavoritas = this.favoritas.map((fav) => {
      const postulanteNombre =
        this.postulantes.find((p) => p.id === fav.postulanteId)?.nombreCompleto ||
        'Postulante desconocido';
      const ofertaNombre =
        this.ofertas.find((o) => o.id === fav.ofertaEmpleoId)?.tituloTrabajo ||
        'Oferta desconocida';

      return {
        ...fav,
        postulanteNombre,
        ofertaNombre,
      };
    });
  }

  eliminarFavorita(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.favoritaService.eliminarFavorita(id).subscribe({
          next: () => {
            this.cargarFavoritas(this.postulanteId); 
            this.openSnackbar('Oferta favorita eliminada correctamente', 'success');
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.openSnackbar('Error al eliminar favorita', 'error');
          }
        });
      }
    });
  }

  obtenerConteoFavoritas(postulanteId: number): void {
    this.favoritaService.contarFavoritasPorPostulante(postulanteId).subscribe({
      next: (count) => {
        this.favoriteCount = count;
      },
      error: () => {
        this.openSnackbar('Error al obtener el conteo de ofertas favoritas.', 'error');
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
