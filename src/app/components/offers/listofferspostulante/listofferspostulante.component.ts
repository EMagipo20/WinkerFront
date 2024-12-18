import { Component, OnInit } from '@angular/core';
import { OfertaEmpleo } from '../../../models/ofertaEmpleo';
import { OfertaEmpleoService } from '../../../services/ofertaEmpleo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../confirme-delete/delete.component';
import { Empresa } from '../../../models/empresa';
import { EmpresaService } from '../../../services/empresa.service';
import { FavoritaService } from '../../../services/favorita.service';
import { AuthService } from '../../../services/auth.service';
import { PostulanteService } from '../../../services/postulante.service';
import { TipoTrabajo } from '../../../models/tipoTrabajo';
import { UbicacionOferta } from '../../../models/ubicacionOferta';
import { UbicacionOfertaService } from '../../../services/ubicacionOferta.service';
import { TipoTrabajoService } from '../../../services/tipoTrabajo.service';
import { DetailsOfferComponent } from '../../details-offer/details-offer';
import { Solicitudes } from '../../../models/solicitudes';
import { SolicitudesService } from '../../../services/solicitudes.service';
import { PostComponent } from '../../post/post.component';

@Component({
  selector: 'app-listofferspostulante',
  templateUrl:'./listofferspostulante.component.html',
  styleUrl:'./listofferspostulante.component.scss'
})
export class ListOffersPostulanteComponent implements OnInit{
  // listar Ofertas
  ofertas: OfertaEmpleo[] = []

  // Listar empresas
  empresas: Empresa[] = [];

  // Listar tipos de trabajo
  tipos: TipoTrabajo[] = [];

  // Listar ubicaciones
  ubicaciones: UbicacionOferta[] = [];

  // Favoritas
  favoritas: number[] = [];

  postulanteId: number = 0;

  // variable para almacenar el conteo de ofertas favoritas
  totalFavoritas: number = 0;

  // elemento de carga
  loading = false;

  // Variable para almacenar nombre de ofertas al buscar
  tituloOferta: string = '';

  mejoresSalarios: boolean = false;

  soloActivas: boolean = false;
  
  // Definir las columnas a mostrar
  displayedColumns: string[] = [
    'id', 'tituloTrabajo', 'salario', 'fechaVencimiento', 'indActivo', 
    'empresa', 'tipoTrabajo', 'ubicacion', 'acciones'
  ];

  constructor(
    private ofertaservice: OfertaEmpleoService,
    private snackBar: MatSnackBar,
    private favoritaService: FavoritaService,
    private authService: AuthService,
    private postulanteService: PostulanteService,
    private empresaService: EmpresaService,
    private ubicacionesService: UbicacionOfertaService,
    private tipoTrabajoService: TipoTrabajoService,
    private solicitudService: SolicitudesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas(); 
    this.cargarUbicaciones();
    this.cargarTiposTrabajo();
    this.cargarPostulanteId();
  }

  cargarPostulanteId(): void {
    const username = this.authService.getUsername();
    if (username) {
      this.postulanteService.getPostulanteIdByUsername(username).subscribe({
        next: (id) => {
          this.postulanteId = id;
        },
        error: () => {
          this.openSnackbar('Error: No se pudo obtener el ID del postulante.', 'error');
        }
      });
    }
  }

  cargarEmpresas(): void {
    this.empresaService.listarEmpresas().subscribe(empresas => {
      this.empresas = empresas;
      this.cargarOfertas(); // Cargar ofertas después de cargar empresas
    });
  }

  cargarTiposTrabajo(): void {
    this.tipoTrabajoService.listarTipoTrabajos().subscribe(tipos => {
      this.tipos = tipos;
      this.cargarOfertas(); 
    });
  }

  cargarUbicaciones(): void {
    this.ubicacionesService.listarUbicaciones().subscribe(ubi => {
      this.ubicaciones = ubi;
      this.cargarOfertas();
    });
  }

  cargarOfertas(): void {
    this.loading = true;
    if (this.soloActivas) {
      this.ofertaservice.OfertasActivas().subscribe({
        next: (ofertas) => {
          this.procesarOfertas(ofertas);
        },
        error: () => {
          this.mostrarErrorCargarOfertas();
        }
      });
    } else {
      this.ofertaservice.listarOfertas().subscribe({
        next: (ofertas) => {
          this.procesarOfertas(ofertas);
        },
        error: () => {
          this.mostrarErrorCargarOfertas();
        }
      });
    }
  }
  
  private procesarOfertas(ofertas: OfertaEmpleo[]): void {
    this.ofertas = ofertas
      .map(oferta => ({
        ...oferta,
        nombreEmpresa: this.empresas.find(e => e.id === oferta.empresaId)?.nombre || 'No asignada',
        nombreTipoTrabajo: this.tipos.find(t => t.id === oferta.tipoTrabajoId)?.tipo || 'No asignado',
        nombreUbi: this.ubicaciones.find(u => u.id === oferta.ubicacionOfertaId)?.departamento || 'No asignada'
      }))
      .sort((a, b) => a.id - b.id);
    this.loading = false;
  }
  
  private mostrarErrorCargarOfertas(): void {
    this.loading = false;
    this.openSnackbar('Error al cargar las ofertas de empleo.', 'error');
  }
  
  toggleSoloActivas(): void {
    this.soloActivas = !this.soloActivas;
    this.cargarOfertas();
  }  

  eliminarOferta(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.ofertaservice.eliminarOferta(id).subscribe({
          next: () => {
            this.cargarOfertas();
            this.openSnackbar('Oferta de empleo eliminado correctamente', 'success');
            this.loading = false;
          }
        });
      }
    });
  }

  //Añadir a favoritos
  agregarAFavoritos(ofertaId: number): void {
    const isFavorite = this.favoritas.includes(ofertaId);
    if (isFavorite) {
      this.favoritaService.eliminarFavorita(ofertaId).subscribe(() => {
        this.favoritas = this.favoritas.filter(id => id !== ofertaId);
        this.openSnackbar('Oferta removida de favoritos.', 'success');
      });
    } else {
      const favorita = { postulanteId: this.postulanteId, ofertaEmpleoId: ofertaId };
      this.favoritaService.agregarFavorita(favorita).subscribe(() => {
        this.favoritas.push(ofertaId);
        this.openSnackbar('Oferta agregada a favoritos.', 'success');
      });
    }
  }

  //Mostrar vista previa de la oferta
  //Antes de enviar soli
  abrirDetalles(oferta: OfertaEmpleo): void {
    const empresa = this.empresas.find(e => e.id === oferta.empresaId);
    const nombreEmpresa = empresa?.nombre || 'No asignada';
    const logotipoEmpresa = empresa?.logotipoBase64 || '';
    
    const nombreUbicacion = this.ubicaciones.find(u => u.id === oferta.ubicacionOfertaId)?.departamento || 'No asignada';
    const nombreTipoTrabajo = this.tipos.find(t => t.id === oferta.tipoTrabajoId)?.tipo || 'No asignado';
  
    const dialogRef = this.dialog.open(DetailsOfferComponent, {
      width: '400px',
      data: {
        ...oferta,
        nombreEmpresa: nombreEmpresa,
        logotipoEmpresa: logotipoEmpresa,
        nombreUbicacion: nombreUbicacion,
        nombreTipoTrabajo: nombreTipoTrabajo,
        postulanteId: this.postulanteId
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.enviar) {
        const solicitud = result.solicitud;
        this.enviarSolicitud(solicitud);
      }
    });
  }

  enviarSolicitud(solicitud: Solicitudes): void {
    this.loading = true;
    this.solicitudService.agregarSolicitud(solicitud).subscribe({
      next: () => {
        this.openSnackbar('Solicitud enviada exitosamente.', 'success');
        this.loading = false;
      },
      error: () => {
        this.openSnackbar('Error al enviar la solicitud.', 'error');
        this.loading = false;
      }
    });
  }

  abrirPostDialog(ofertaEmpleoId: number): void {
    const dialogRef = this.dialog.open(PostComponent, {
      width: '400px'
    });

    dialogRef.componentInstance.post.ofertaEmpleoId = ofertaEmpleoId;
    dialogRef.componentInstance.post.postulanteId = this.postulanteId;
  }

  buscarOfertaPorTitulo(titulo: string): void {
    if (titulo.trim() === '') {
      this.cargarOfertas();
    } else {
      this.ofertaservice.buscarOfertasPorTitulo(titulo).subscribe({
        next: (ofertas) => {
          this.ofertas = ofertas.map(oferta => ({
            ...oferta,
            nombreEmpresa: this.empresas.find(e => e.id === oferta.empresaId)?.nombre || 'No asignada',
            nombreTipoTrabajo: this.tipos.find(t => t.id === oferta.tipoTrabajoId)?.tipo || 'No asignado',
            nombreUbi: this.ubicaciones.find(u => u.id === oferta.ubicacionOfertaId)?.departamento || 'No asignada'
          }));
        },
        error: () => {
          this.openSnackbar('Error al buscar ofertas de empleo', 'error');
        }
      });
    }
  }

  filtrarMejoresSalarios(): void {
    if (this.mejoresSalarios) {
      this.ofertaservice.obtenerMejoresSalarios().subscribe({
        next: (ofertas) => {
          this.ofertas = ofertas.map(oferta => ({
            ...oferta,
            nombreEmpresa: this.empresas.find(e => e.id === oferta.empresaId)?.nombre || 'No asignada',
            nombreTipoTrabajo: this.tipos.find(t => t.id === oferta.tipoTrabajoId)?.tipo || 'No asignado',
            nombreUbi: this.ubicaciones.find(u => u.id === oferta.ubicacionOfertaId)?.departamento || 'No asignada'
          }));
        },
        error: () => {
          this.openSnackbar('Error al filtrar ofertas con mejores salarios.', 'error');
        }
      });
    } else {
      this.cargarOfertas();
    }
  }

  clearSearch(): void {
    this.tituloOferta = '';
    this.buscarOfertaPorTitulo(this.tituloOferta);
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