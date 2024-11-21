import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UbicacionOferta } from '../../models/ubicacionOferta';
import { UbicacionOfertaService } from '../../services/ubicacionOferta.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../confirme-delete/delete.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-locationOffer',
  templateUrl: './locationOffer.component.html',
  styleUrl: './locationOffer.component.scss'
})
export class LocationOfferComponent {
  locationOfferForm: FormGroup = new FormGroup({});
  ubicacionOferta: UbicacionOferta = new UbicacionOferta();

  ubicaciones: UbicacionOferta [] = [];
  displayedColumns: string[] = ['id', 'departamento', 'distrito', 'direccion', 'acciones'];

  // elemento de carga
  loading = false;

  filtro: string = '';

  // variable para verificar si es una actualización
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
        this.ubicaciones = ubis;
        this.loading = false;
      }
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
            this.snackBar.open('Ubicacion oferta eliminado correctamente', 'Cerrar', { duration: 3000 });
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
            this.snackBar.open('Ubicacion oferta actualizada con éxito', 'Cerrar', { duration: 3000 });
            this.listarUbicacionesOferta();
            this.resetForm();
            this.loading = false;
          }
        });
      } else {
        this.ubicacionService.agregarUbicacion(ubis).subscribe({
          next: () => {
            this.snackBar.open('Ubicacion oferta agregado con éxito', 'Cerrar', { duration: 3000 });
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
  
    // Ejecutar las tres búsquedas en paralelo
    forkJoin({
      ubicacionesDistrito: this.ubicacionService.buscarPorDistrito(filtro),
      ubicacionesDepartamento: this.ubicacionService.buscarPorDepartamento(filtro),
      ubicacionesDireccion: this.ubicacionService.buscarPorDireccion(filtro)
    }).subscribe({
      next: ({ ubicacionesDistrito, ubicacionesDepartamento, ubicacionesDireccion }) => {
        // Concatenar los resultados de las tres búsquedas
        this.ubicaciones = [
          ...ubicacionesDistrito,
          ...ubicacionesDepartamento,
          ...ubicacionesDireccion
        ];
  
        // Verificar si se encontraron ubicaciones
        if (this.ubicaciones.length === 0) {
          this.snackBar.open(`No se ha encontrado un departamento, distrito o dirección con el nombre: ${filtro}`, 'Cerrar', { duration: 3000 });
        }
        
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al realizar la búsqueda de ubicaciones', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
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
}
