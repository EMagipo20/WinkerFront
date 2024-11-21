import { Component, OnInit } from '@angular/core';
import { OfertaEmpleo } from '../../../models/ofertaEmpleo';
import { OfertaEmpleoService } from '../../../services/ofertaEmpleo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../confirme-delete/delete.component';
import { Empresa } from '../../../models/empresa';
import { EmpresaService } from '../../../services/empresa.service';
import { TipoTrabajo } from '../../../models/tipoTrabajo';
import { UbicacionOferta } from '../../../models/ubicacionOferta';
import { TipoTrabajoService } from '../../../services/tipoTrabajo.service';
import { UbicacionOfertaService } from '../../../services/ubicacionOferta.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-listdeleteoffers',
  templateUrl:'./listdeleteoffers.component.html',
  styleUrls: ['./listdeleteoffers.component.scss']
})
export class ListdeleteoffersComponent implements OnInit {
  ofertas: OfertaEmpleo[] = [];
  empresas: Empresa[] = [];
  tipos: TipoTrabajo[] = [];
  ubicaciones: UbicacionOferta[] = [];
  loading = false;
  username: string = '';
  totalOfertas: number = 0;
  empresaId: number = 0;
  tituloOferta: string = '';
  soloActivas: boolean = false;

  displayedColumns: string[] = [
    'id', 'tituloTrabajo', 'descripcion', 'salario', 'fechaPublicacion', 'fechaVencimiento', 'indActivo', 
    'empresa', 'tipoTrabajo', 'ubicacion', 'acciones'
  ];

  constructor(
    private ofertaService: OfertaEmpleoService,
    private snackBar: MatSnackBar,
    private empresaService: EmpresaService,
    private tipoService: TipoTrabajoService,
    private ubicacionService: UbicacionOfertaService,
    private dialog: MatDialog,
    private authService: AuthService,
    private usuarioService: UsuarioService,
  ) { 
    this.username = this.authService.getUsername(); 
  }

  ngOnInit(): void {
    this.cargarEmpresas();
    this.cargarTiposTrabajo();
    this.cargarUbicaciones();
  }

  cargarEmpresas(): void {
    this.empresaService.listarEmpresas().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
        this.obtenerEmpresaId();
      },
      error: () => this.snackBar.open('Error al cargar empresas.', 'Cerrar', { duration: 3000 })
    });
  }

  cargarTiposTrabajo(): void {
    this.tipoService.listarTipoTrabajos().subscribe({
      next: (tiposT) => {
        this.tipos = tiposT;
        this.obtenerEmpresaId();
      },
      error: () => this.snackBar.open('Error al cargar tipos de trabajo.', 'Cerrar', { duration: 3000 })
    });
  }

  cargarUbicaciones(): void {
    this.ubicacionService.listarUbicaciones().subscribe({
      next: (ubi) => {
        this.ubicaciones = ubi;
        this.obtenerEmpresaId();
      },
      error: () => this.snackBar.open('Error al cargar ubicaciones de oferta.', 'Cerrar', { duration: 3000 })
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
            this.contarOfertasPorEmpresa();
            this.cargarOfertas();
          } else {
            this.snackBar.open('Empresa no encontrada', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.snackBar.open('Usuario no encontrado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarOfertas(): void {
    this.loading = true;
    if (this.soloActivas) {
      this.ofertaService.OfertasActivas().subscribe({
        next: (ofertas) => {
          this.ofertas = this.mapearOfertas(ofertas);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar ofertas activas.', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.ofertaService.listarOfertaEmpleoPorEmpresa(this.empresaId).subscribe({
        next: (ofertas) => {
          this.ofertas = this.mapearOfertas(ofertas);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar las ofertas de empleo.', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  toggleSoloActivas(event: any): void {
    this.soloActivas = event.checked;
    this.cargarOfertas();
  }

  mapearOfertas(ofertas: OfertaEmpleo[]): OfertaEmpleo[] {
    return ofertas.map(oferta => ({
      ...oferta,
      nombreEmpresa: this.empresas.find(e => e.id === oferta.empresaId)?.nombre || 'No asignada',
      nombreTipoTrabajo: this.tipos.find(t => t.id === oferta.tipoTrabajoId)?.tipo || 'No asignado',
      nombreUbi: this.ubicaciones.find(u => u.id === oferta.ubicacionOfertaId)?.departamento || 'No asignada'
    })).sort((a, b) => a.id - b.id);
  }

  eliminarOferta(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.ofertaService.eliminarOferta(id).subscribe({
          next: () => {
            this.cargarOfertas();
            this.snackBar.open('Oferta eliminada correctamente', 'Cerrar', { duration: 3000 });
            this.loading = false;
          }
        });
      }
    });
  }
  
  contarOfertasPorEmpresa(): void {
    this.ofertaService.contarPorEmpresaId(this.empresaId).subscribe({
      next: (total) => {
        this.totalOfertas = total;
        this.snackBar.open(`Total de ofertas: ${total}`, 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al contar las ofertas.', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
