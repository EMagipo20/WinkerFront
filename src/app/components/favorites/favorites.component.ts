import { Component, OnInit } from '@angular/core';
import { Favorita } from '../../models/favorita';
import { OfertaEmpleo } from '../../models/ofertaEmpleo';
import { OfertaEmpleoService } from '../../services/ofertaEmpleo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostulanteService } from '../../services/postulante.service';
import { FavoritaService } from '../../services/favorita.service';
import { MatDialog } from '@angular/material/dialog';
import { Postulante } from '../../models/postulante';
import { DeleteComponent } from '../confirme-delete/delete.component';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-favorites',
  templateUrl:'./favorites.component.html',
  styleUrl:'./favorites.component.scss'
})
export class FavoritesComponent implements OnInit{
  favoritas: Favorita[] = []; // Lista de favoritas
  ofertas: OfertaEmpleo[] = []; // Lista de ofertas
  postulantes: Postulante[] = []; // Lista de postulantes
  username: string = '';
  postulanteId: number = 0;
  favoriteCount: number = 0;

  loading = false;
  displayedColumns: string[] = ['id', 'postulanteNombre', 'ofertaNombre', 'acciones'];

  constructor(
    private ofertaService: OfertaEmpleoService,
    private snackBar: MatSnackBar,
    private favoritaService: FavoritaService,
    private postulanteService: PostulanteService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog
  ) { this.username = this.authService.getUsername(); }

  ngOnInit(): void {
    this.cargarPostulantes();
    this.cargarOfertas();
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe(postulantes => {
      this.postulantes = postulantes;
      this.obtenerPostulanteId();
    });
  }

  obtenerPostulanteId(): void {
    if (!this.username) {
      this.snackBar.open('No hay usuario logeado', 'Cerrar', { duration: 3000 });
      return;
    }
    this.usuarioService.listarTodos().subscribe(usuarios => {
      const usuarioLogueado = usuarios.find(u => u.username === this.username);

      if (usuarioLogueado) {
        const postulanteLogueado = this.postulantes.find(p => p.usuarioId === usuarioLogueado.id);
        
        if (postulanteLogueado) {
          this.postulanteId = postulanteLogueado.id;
          this.obtenerConteoFavoritas(this.postulanteId);
          this.cargarFavoritas(this.postulanteId);
        } else {
          this.snackBar.open('Postulante no encontrado', 'Cerrar', { duration: 3000 });
        }
      } else {
        this.snackBar.open('Usuario no encontrado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarOfertas(): void {
    this.ofertaService.listarOfertas().subscribe(ofertas => {
      this.ofertas = ofertas;
      this.obtenerPostulanteId();
    });
  }

  cargarFavoritas(postulanteId: number): void {
    this.loading = true;
    this.favoritaService.listarFavoritasPorPostulante(postulanteId).subscribe({
      next: (favoritas) => {
        this.favoritas = favoritas.map(fav => ({
          ...fav,
          postulanteNombre: this.postulantes.find(p => p.id === fav.postulanteId)?.nombreCompleto || 'Postulante desconocido',
          ofertaNombre: this.ofertas.find(o => o.id === fav.ofertaEmpleoId)?.tituloTrabajo || 'Oferta desconocida'
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar favoritas.', 'Cerrar', { duration: 3000 });
      }
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
            this.snackBar.open('Oferta favorita eliminada correctamente', 'Cerrar', { duration: 3000 });
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.snackBar.open('Error al eliminar la oferta favorita', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open('Error al obtener el conteo de ofertas favoritas.', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
