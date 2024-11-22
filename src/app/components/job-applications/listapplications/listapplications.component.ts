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
        error: () => this.snackBar.open('Error al cargar ofertas.', 'Cerrar', { duration: 3000 })
      });
    }
  
    cargarPostulantes(): void {
      this.postulanteService.listarPostulantes().subscribe({
        next: (postulantes) => {
          this.postulantes = postulantes;
          this.obtenerEmpresaId();
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
              this.cargarSolicitudes();
            } else {
              this.snackBar.open('Empresa no encontrada', 'Cerrar', { duration: 3000 });
            }
          });
        } else {
          this.snackBar.open('Usuario no encontrado', 'Cerrar', { duration: 3000 });
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
                this.snackBar.open('Error al cargar las solicitudes.', 'Cerrar', { duration: 3000 });
              }
            });
          });
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar las ofertas.', 'Cerrar', { duration: 3000 });
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
          error: () => this.snackBar.open('Error al buscar postulante.', 'Cerrar', { duration: 3000 })
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
          this.snackBar.open('Solicitud aceptada correctamente.', 'Cerrar', { duration: 3000 });
          this.cargarSolicitudes();
        },
        error: () => {
          this.snackBar.open('Error al aceptar la solicitud.', 'Cerrar', { duration: 3000 });
        }
      });
    }
  
    rechazarSolicitud(solicitud: Solicitudes): void {
      solicitud.estadoSolicitud = 'Rechazada';
      this.solicitudService.actualizarSolicitud(solicitud).subscribe({
        next: () => {
          this.snackBar.open('Solicitud rechazada correctamente.', 'Cerrar', { duration: 3000 });
          this.cargarSolicitudes();
        },
        error: () => {
          this.snackBar.open('Error al rechazar la solicitud.', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open('No se encontró el postulante.', 'Cerrar', { duration: 3000 });
      }
    }
}