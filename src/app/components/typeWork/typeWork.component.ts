import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TipoTrabajo } from '../../models/tipoTrabajo';
import { TipoTrabajoService } from '../../services/tipoTrabajo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteComponent } from '../confirme-delete/delete.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-typeWork',
  templateUrl:'./typeWork.component.html',
  styleUrl:'./typeWork.component.scss'
})
export class TypeWorkComponent implements OnInit{
  typeWorkForm: FormGroup = new FormGroup({});
  tipoTrabajo: TipoTrabajo = new TipoTrabajo();

  dataSource = new MatTableDataSource<TipoTrabajo>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'tipo', 'dia', 'horaInicio', 'horaFin', 'acciones'];

  // elemento de carga
  loading = false;

  //Filtro de busqueda
  filtro: string = '';

  // variable para verificar si es una actualización
  isEditMode = false;

  constructor(
    private tipoTrabajoService: TipoTrabajoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.listarTiposTrabajo();
  }

  private initForm(): void {
    this.typeWorkForm = new FormGroup({
      'id': new FormControl(this.tipoTrabajo.id),
      'tipo': new FormControl(this.tipoTrabajo.tipo, Validators.required),
      'dia': new FormControl(this.tipoTrabajo.dia, Validators.required),
      'horaInicio': new FormControl(this.tipoTrabajo.horaInicio, Validators.required),
      'horaFin': new FormControl(this.tipoTrabajo.horaFin, Validators.required)
    });
  }

  listarTiposTrabajo(): void {
    this.loading = true;
    this.tipoTrabajoService.listarTipoTrabajos().subscribe({
      next: (tipos) => {
        this.dataSource.data = tipos.sort((a, b) => a.id - b.id);
        this.loading = false;
      },
      error: () => {
        this.openSnackbar('Error al cargar los tipos de trabajo.', 'error');
        this.loading = false;
      },
    });
  }

  // Método para editar un tipo de trabajo
  editarTipoTrabajo(tipoTrabajo: TipoTrabajo): void {
    this.isEditMode = true;
    this.typeWorkForm.patchValue({
      id: tipoTrabajo.id,
      tipo: tipoTrabajo.tipo,
      dia: tipoTrabajo.dia,
      horaInicio: tipoTrabajo.horaInicio,
      horaFin: tipoTrabajo.horaFin
    });
  }

  eliminarTipoTrb(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.tipoTrabajoService.eliminarTipoTrabajo(id).subscribe({
          next: () => {
            this.listarTiposTrabajo();
            this.openSnackbar('Tipo de trabajo eliminado correctamente', 'success');
            this.loading = false;
          }
        });
      }
    });
  }

  onSubmitTipoTrabajo(): void {
    if (this.typeWorkForm.valid) {
      this.loading = true;
      const tipoTrabajo = this.typeWorkForm.value;

      if (this.isEditMode) {
        this.tipoTrabajoService.actualizarTipoTrabajo(tipoTrabajo).subscribe({
          next: () => {
            this.openSnackbar('Tipo de trabajo actualizado con éxito', 'success');
            this.listarTiposTrabajo();
            this.resetForm();
            this.loading = false;
          }
        });
      } else {
        // Agregar un nuevo tipo de trabajo
        this.tipoTrabajoService.agregarTipoTrabajo(tipoTrabajo).subscribe({
          next: () => {
            this.openSnackbar('Tipo de trabajo agregado con éxito', 'success');
            this.listarTiposTrabajo();
            this.resetForm();
            this.loading = false;
          }
        });
      }
    }
  }

  buscarTiposTrabajo(filtro: string): void {
    this.dataSource.filter = filtro.trim().toLowerCase();
    if (this.dataSource.filteredData.length === 0) {
      this.openSnackbar(`No se encontraron resultados para: ${filtro}`, 'warning');
    }
  }

  clearSearch(): void {
    this.filtro = '';
    this.listarTiposTrabajo();
  }

  private resetForm(): void {
    this.typeWorkForm.reset();
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