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
        this.openSnackbar('Error al contar las solicitudes por postulante.', 'error');
      }
    });
  }

  cargarOfertas(): void {
    this.ofertaService.listarOfertas().subscribe({
      next: (ofertas) => {
        this.ofertas = ofertas;
        this.obtenerPostulanteId();
      },
      error: () => this.openSnackbar('Error al cargar ofertas.', 'error')
    });
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe({
      next: (postulantes) => {
        this.postulantes = postulantes;
        this.obtenerPostulanteId();
      },
      error: () => this.openSnackbar('Error al cargar postulantes.', 'error')
    });
  }

  obtenerPostulanteId(): void {
    if (!this.username) {
      this.openSnackbar('No hay usuario logeado', 'warning');
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
        this.openSnackbar('Usuario no encontrado', 'warning');
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
        this.openSnackbar('Error al cargar las solicitudes.', 'error');
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
            this.openSnackbar('Soliitud eliminada correctamente', 'success');
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.openSnackbar('Error al eliminar solicitud', 'error');
          }
        });
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
