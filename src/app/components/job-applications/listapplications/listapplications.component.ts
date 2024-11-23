import { Component, OnInit } from '@angular/core';
import { Solicitudes } from '../../../models/solicitudes';
import { OfertaEmpleo } from '../../../models/ofertaEmpleo';
import { Postulante } from '../../../models/postulante';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { OfertaEmpleoService } from '../../../services/ofertaEmpleo.service';
import { PostulanteService } from '../../../services/postulante.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DetailsPostulantComponent } from '../../details-postulant/details-postulant.component';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Empresa } from '../../../models/empresa';
import { EmpresaService } from '../../../services/empresa.service';

@Component({
  selector: 'app-listapplications',
  templateUrl: './listapplications.component.html',
  styleUrls: ['./listapplications.component.scss']
})
export class ListApplicationsComponent implements OnInit {
    solicitudes: Solicitudes[] = [];
    ofertas: OfertaEmpleo[] = [];
    postulantes: Postulante[] = [];
    empresas: Empresa[] = [];
    loading = false;
    displayedColumns: string[] = ['id', 'fechaSolicitud', 'estadoSolicitud', 'tituloTrabajo', 'nombreCompleto', 'acciones'];
    searchTerm: string = '';
    username: string = '';
    empresaId: number = 0;
  
    constructor(
      private solicitudService: SolicitudesService,
      private empresaService: EmpresaService,
      private snackBar: MatSnackBar,
      private ofertaService: OfertaEmpleoService,
      private postulanteService: PostulanteService,
      private authService: AuthService,
      private usuarioService: UsuarioService,
      private dialog: MatDialog
    ) { 
      this.username = this.authService.getUsername(); 
    }
  
    ngOnInit(): void {
      this.cargarOfertas();
      this.cargarPostulantes();
      this.obtenerEmpresaId();
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
          this.obtenerEmpresaId();
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
              this.cargarSolicitudes();
            } else {
              this.openSnackbar('Empresa no encontrada', 'warning');
            }
          });
        } else {
          this.openSnackbar('Usuario no encontrado', 'warning');
        }
      });
    }

    cargarSolicitudes(): void {
      this.loading = true;
      this.ofertaService.listarOfertaEmpleoPorEmpresa(this.empresaId).subscribe({
        next: (ofertas) => {
          this.ofertas = ofertas;
          this.solicitudes = [];
          this.ofertas.forEach(oferta => {
            this.solicitudService.listarSolicitudesPorOferta(oferta.id).subscribe({
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
          });
        },
        error: () => {
          this.loading = false;
          this.openSnackbar('Error al cargar las ofertas.', 'error');
        }
      });
    }

    buscarPostulantePorNombreOEmail(term: string): void {
      if (term.trim() === '') {
        this.cargarSolicitudes();
      } else {
        const isEmail = term.includes('@');
        const searchObservable = isEmail
          ? this.postulanteService.buscarPostulantePorCorreo(term)
          : this.postulanteService.buscarPostulantePorNombre(term);

        searchObservable.subscribe({
          next: (filteredPostulantes) => {
            const filteredIds = filteredPostulantes.map(p => p.id);
            this.solicitudes = this.solicitudes.filter(solicitud =>
              filteredIds.includes(solicitud.postulanteId)
            );
          },
          error: () => this.openSnackbar('Error al buscar postulante.', 'error')
        });
      }
    }

    clearSearch(): void {
      this.searchTerm = '';
      this.cargarSolicitudes();
    }
  
    aceptarSolicitud(solicitud: Solicitudes): void {
      solicitud.estadoSolicitud = 'Aceptada';
      this.solicitudService.actualizarSolicitud(solicitud).subscribe({
        next: () => {
          this.openSnackbar('Solicitud aceptada correctamente.', 'success');
          this.cargarSolicitudes();
        },
        error: () => {
          this.openSnackbar('Error al aceptar la solicitud.', 'error');
        }
      });
    }
  
    rechazarSolicitud(solicitud: Solicitudes): void {
      solicitud.estadoSolicitud = 'Rechazada';
      this.solicitudService.actualizarSolicitud(solicitud).subscribe({
        next: () => {
          this.openSnackbar('Solicitud rechazada correctamente.', 'success');
          this.cargarSolicitudes();
        },
        error: () => {
          this.openSnackbar('Error al rechazar la solicitud.', 'error');
        }
      });
    }
  
    verDetallesPostulante(postulanteId: number): void {
      const postulante = this.postulantes.find(p => p.id === postulanteId);
      if (postulante) {
        this.dialog.open(DetailsPostulantComponent, {
          width: '400px',
          data: postulante
        });
      } else {
        this.openSnackbar('No se encontró el postulante.', 'warning');
      }
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