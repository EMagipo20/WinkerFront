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
    'id', 'tituloTrabajo', 'salario', 'fechaPublicacion', 'fechaVencimiento', 'indActivo', 'tipoTrabajo', 'ubicacion', 'acciones'
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
      error: () => this.openSnackbar('Error al cargar empresas.', 'error')
    });
  }

  cargarTiposTrabajo(): void {
    this.tipoService.listarTipoTrabajos().subscribe({
      next: (tiposT) => {
        this.tipos = tiposT;
        this.obtenerEmpresaId();
      },
      error: () => this.openSnackbar('Error al cargar tipos de trabajo.', 'error')
    });
  }

  cargarUbicaciones(): void {
    this.ubicacionService.listarUbicaciones().subscribe({
      next: (ubi) => {
        this.ubicaciones = ubi;
        this.obtenerEmpresaId();
      },
      error: () => this.openSnackbar('Error al cargar ubicaciones de oferta.', 'error')
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
            this.contarOfertasPorEmpresa();
            this.cargarOfertas();
          } else {
            this.openSnackbar('Empresa no encontrada', 'warning');
          }
        });
      } else {
        this.openSnackbar('Usuario no encontrado', 'warning');
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
          this.openSnackbar('Error al cargar ofertas activas.', 'error');
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
          this.openSnackbar('Error al cargar las ofertas de empleo.', 'error');
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
            this.openSnackbar('Oferta eliminada correctamente', 'success');
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
        this.openSnackbar(`Total de ofertas: ${total}`, 'success');
      },
      error: () => {
        this.openSnackbar('Error al contar las ofertas.', 'error');
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
