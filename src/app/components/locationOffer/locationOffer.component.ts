import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UbicacionOferta } from '../../models/ubicacionOferta';
import { UbicacionOfertaService } from '../../services/ubicacionOferta.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../confirme-delete/delete.component';
import { forkJoin } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-locationOffer',
  templateUrl: './locationOffer.component.html',
  styleUrl: './locationOffer.component.scss'
})
export class LocationOfferComponent {
  locationOfferForm: FormGroup = new FormGroup({});
  ubicacionOferta: UbicacionOferta = new UbicacionOferta();

  // DataSource y paginador para la tabla
  dataSource = new MatTableDataSource<UbicacionOferta>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'departamento', 'distrito', 'direccion', 'acciones'];

  // elemento de carga
  loading = false;

  filtro: string = '';

  isEditMode = false;

  constructor(
    private ubicacionService: UbicacionOfertaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.listarUbicacionesOferta();
  }

  private initForm(): void {
    this.locationOfferForm = new FormGroup({
      'id': new FormControl(this.ubicacionOferta.id),
      'departamento': new FormControl(this.ubicacionOferta.departamento, Validators.required),
      'distrito': new FormControl(this.ubicacionOferta.distrito, Validators.required),
      'direccion': new FormControl(this.ubicacionOferta.direccion, Validators.required),
    });
  }

  listarUbicacionesOferta(): void {
    this.loading = true;
    this.ubicacionService.listarUbicaciones().subscribe({
      next: (ubis) => {
        this.dataSource.data = ubis.sort((a, b) => a.id - b.id);
        this.loading = false;
      },
      error: () => {
        this.openSnackbar('Error al cargar ubicaciones.', 'error');
        this.loading = false;
      },
    });
  }

  editarUbicacionTrabajo(ubi: UbicacionOferta): void {
    this.isEditMode = true;
    this.locationOfferForm.patchValue({
      id: ubi.id,
      departamento: ubi.departamento,
      distrito: ubi.distrito,
      direccion: ubi.direccion
    });
  }

  eliminarTipoTrb(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.ubicacionService.eliminarUbicacion(id).subscribe({
          next: () => {
            this.listarUbicacionesOferta();
            this.openSnackbar('Ubicacion oferta eliminado correctamente', 'success');
            this.loading = false;
          }
        });
      }
    });
  }

  onSubmitUbicacion(): void {
    if (this.locationOfferForm.valid) {
      this.loading = true;
      const ubis = this.locationOfferForm.value;

      if (this.isEditMode) {
        this.ubicacionService.actualizarUbicacion(ubis).subscribe({
          next: () => {
            this.openSnackbar('Ubicacion oferta actualizada con éxito', 'success');
            this.listarUbicacionesOferta();
            this.resetForm();
            this.loading = false;
          }
        });
      } else {
        this.ubicacionService.agregarUbicacion(ubis).subscribe({
          next: () => {
            this.openSnackbar('Ubicacion oferta registrada con éxito', 'success');
            this.listarUbicacionesOferta();
            this.resetForm();
            this.loading = false;
          }
        });
      }
    }
  }

  buscarUbicacionesPorFiltro(filtro: string): void {
    if (filtro.trim() === '') {
      this.listarUbicacionesOferta();
      return;
    }

    this.loading = true;

    forkJoin({
      ubicacionesDistrito: this.ubicacionService.buscarPorDistrito(filtro),
      ubicacionesDepartamento: this.ubicacionService.buscarPorDepartamento(filtro),
      ubicacionesDireccion: this.ubicacionService.buscarPorDireccion(filtro),
    }).subscribe({
      next: ({ ubicacionesDistrito, ubicacionesDepartamento, ubicacionesDireccion }) => {
        this.dataSource.data = [
          ...ubicacionesDistrito,
          ...ubicacionesDepartamento,
          ...ubicacionesDireccion,
        ];

        if (this.dataSource.data.length === 0) {
          this.openSnackbar(`No se encontraron resultados para: ${filtro}`, 'warning');
        }

        this.loading = false;
      },
      error: () => {
        this.openSnackbar('Error al realizar la búsqueda.', 'error');
        this.loading = false;
      },
    });
  }

  clearSearch(): void {
    this.filtro = '';
    this.listarUbicacionesOferta();
  }

  private resetForm(): void {
    this.locationOfferForm.reset();
    this.isEditMode = false;
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
