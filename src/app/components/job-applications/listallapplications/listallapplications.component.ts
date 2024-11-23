import { Component, OnInit } from '@angular/core';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfertaEmpleoService } from '../../../services/ofertaEmpleo.service';
import { PostulanteService } from '../../../services/postulante.service';
import { OfertaEmpleo } from '../../../models/ofertaEmpleo';
import { Postulante } from '../../../models/postulante';
import { DeleteComponent } from '../../confirme-delete/delete.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-listallapplications',
  templateUrl: './listallapplications.component.html',
  styleUrls: ['./listallapplications.component.scss']
})
export class ListallapplicationsComponent implements OnInit {
  solicitudes: any[] = [];
  ofertas: OfertaEmpleo[] = [];
  postulantes: Postulante[] = [];
  loading = false;
  solicitudCount: number = 0;
  username: string = '';
  postulanteId: number = 0;

  constructor(
    private solicitudService: SolicitudesService,
    private snackBar: MatSnackBar,
    private ofertaService: OfertaEmpleoService,
    private postulanteService: PostulanteService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog
  ) { this.username = this.authService.getUsername(); }

  ngOnInit(): void {
    this.cargarOfertas();
    this.cargarPostulantes();
  }

  contarSolicitudesPorPostulante(postulanteId: number): void {
    this.solicitudService.contarSolicitudesPorPostulante(postulanteId).subscribe({
      next: (count) => {
        this.solicitudCount = count;
      },
      error: () => {
        this.snackBar.open('Error al contar las solicitudes por postulante.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarOfertas(): void {
    this.ofertaService.listarOfertas().subscribe({
      next: (ofertas) => {
        this.ofertas = ofertas;
        this.obtenerPostulanteId();
      },
      error: () => this.snackBar.open('Error al cargar ofertas.', 'Cerrar', { duration: 3000 })
    });
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe({
      next: (postulantes) => {
        this.postulantes = postulantes;
        this.obtenerPostulanteId();
      },
      error: () => this.snackBar.open('Error al cargar postulantes.', 'Cerrar', { duration: 3000 })
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
          this.cargarSolicitudes(this.postulanteId);
          this.contarSolicitudesPorPostulante(this.postulanteId);
        }
      } else {
        this.snackBar.open('Usuario no encontrado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarSolicitudes(postulanteId: number): void {
    this.loading = true;
    this.solicitudService.listarSolicitudesPorPostulante(postulanteId).subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes.map(solicitud => ({
          ...solicitud,
          tituloTrabajo: this.ofertas.find(o => o.id === solicitud.ofertaEmpleoId)?.tituloTrabajo || 'No asignado',
          nombreCompleto: this.postulantes.find(p => p.id === solicitud.postulanteId)?.nombreCompleto || 'No asignado'
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar las solicitudes.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  eliminarSolicitud(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.solicitudService.eliminarSolicitud(id).subscribe({
          next: () => {
            this.cargarSolicitudes(this.postulanteId); 
            this.snackBar.open('Soliitud eliminada correctamente', 'Cerrar', { duration: 3000 });
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.snackBar.open('Error al eliminar solicitud', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
