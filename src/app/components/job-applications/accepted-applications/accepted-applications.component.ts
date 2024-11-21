import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { Solicitudes } from '../../../models/solicitudes';
import { OfertaEmpleoService } from '../../../services/ofertaEmpleo.service';
import { PostulanteService } from '../../../services/postulante.service';
import { OfertaEmpleo } from '../../../models/ofertaEmpleo';
import { Postulante } from '../../../models/postulante';
import { DetailsPostulantComponent } from '../../details-postulant/details-postulant.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-accepted-applications',
  templateUrl: './accepted-applications.component.html',
  styleUrls: ['./accepted-applications.component.scss']
})
export class AcceptedApplicationsComponent implements OnInit {
    solicitudesAceptadas: Solicitudes[] = [];
    ofertas: OfertaEmpleo[] = [];
    postulantes: Postulante[] = [];
    displayedColumns: string[] = ['id', 'fechaSolicitud', 'tituloTrabajo', 'nombreCompleto', 'acciones'];
    searchTerm: string = '';
  
    constructor(
      private solicitudService: SolicitudesService,
      private ofertaService: OfertaEmpleoService,
      private postulanteService: PostulanteService,
      private snackBar: MatSnackBar,
      private dialog: MatDialog
    ) {}
  
    ngOnInit(): void {
      this.cargarDatosAuxiliares();
    }
  
    cargarDatosAuxiliares(): void {
      this.ofertaService.listarOfertas().subscribe({
        next: (ofertas) => {
          this.ofertas = ofertas;
          this.cargarPostulantes();
        },
        error: () => this.snackBar.open('Error al cargar ofertas.', 'Cerrar', { duration: 3000 })
      });
    }
  
    cargarPostulantes(): void {
      this.postulanteService.listarPostulantes().subscribe({
        next: (postulantes) => {
          this.postulantes = postulantes;
          this.cargarSolicitudesAceptadas();
        },
        error: () => this.snackBar.open('Error al cargar postulantes.', 'Cerrar', { duration: 3000 })
      });
    }
  
    cargarSolicitudesAceptadas(): void {
      this.solicitudService.solicitudesAceptadas().subscribe({
        next: (solicitudes) => {
          this.solicitudesAceptadas = solicitudes.map(solicitud => ({
            ...solicitud,
            tituloTrabajo: this.ofertas.find(o => o.id === solicitud.ofertaEmpleoId)?.tituloTrabajo || 'No asignado',
            nombreCompleto: this.postulantes.find(p => p.id === solicitud.postulanteId)?.nombreCompleto || 'No asignado'
          }));
        },
        error: () => {
          this.snackBar.open('Error al cargar las solicitudes aceptadas.', 'Cerrar', { duration: 3000 });
        }
      });
    }

    buscarPostulantePorNombreOEmail(term: string): void {
      if (term.trim() === '') {
        this.cargarSolicitudesAceptadas();
      } else {
        const isEmail = term.includes('@');
        const searchObservable = isEmail
          ? this.postulanteService.buscarPostulantePorCorreo(term)
          : this.postulanteService.buscarPostulantePorNombre(term);

        searchObservable.subscribe({
          next: (filteredPostulantes) => {
            const filteredIds = filteredPostulantes.map(p => p.id);
            this.solicitudesAceptadas = this.solicitudesAceptadas.filter(solicitud =>
              filteredIds.includes(solicitud.postulanteId)
            ).map(solicitud => ({
              ...solicitud,
              tituloTrabajo: this.ofertas.find(o => o.id === solicitud.ofertaEmpleoId)?.tituloTrabajo || 'No asignado',
              nombreCompleto: this.postulantes.find(p => p.id === solicitud.postulanteId)?.nombreCompleto || 'No asignado'
            }));
          },
          error: () => this.snackBar.open('Error al buscar postulante.', 'Cerrar', { duration: 3000 })
        });
      }
    }

    clearSearch(): void {
      this.searchTerm = '';
      this.cargarSolicitudesAceptadas();
    }
  
    verDetallesEmpleado(postulanteId: number): void {
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
