import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Rubro } from '../../models/rubro';
import { RubroService } from '../../services/rubro.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../confirme-delete/delete.component';

@Component({
  selector: 'app-heading',
  templateUrl: './heading.component.html',
  styleUrls: ['./heading.component.scss']
})
export class HeadingComponent implements OnInit {
  headingForm: FormGroup = new FormGroup({});
  dataSource = new MatTableDataSource<Rubro>();
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  filtro: string = '';
  isEditMode = false;
  loading = false;
  totalRubros = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private rubroService: RubroService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.listarRubrosEmpresa();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private initForm(): void {
    this.headingForm = new FormGroup({
      id: new FormControl(''),
      nombreRubro: new FormControl('', Validators.required),
    });
  }

  listarRubrosEmpresa(): void {
    this.loading = true;
    this.rubroService.listarRubros().subscribe({
      next: (rubros) => {
        this.dataSource.data = rubros;
        this.totalRubros = rubros.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar los rubros.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  buscarRubro(filtro: string): void {
    this.dataSource.filter = filtro.trim().toLowerCase();
    this.totalRubros = this.dataSource.filteredData.length;
  }

  clearSearch(): void {
    this.filtro = '';
    this.buscarRubro('');
  }

  editarRubro(rubro: Rubro): void {
    this.isEditMode = true;
    this.headingForm.patchValue({
      id: rubro.id,
      nombreRubro: rubro.nombreRubro
    });
  }

  eliminarRubro(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.rubroService.eliminarRubro(id).subscribe({
          next: () => {
            this.listarRubrosEmpresa();
            this.snackBar.open('Rubro eliminado correctamente.', 'Cerrar', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Error al eliminar el rubro.', 'Cerrar', { duration: 3000 });
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  onSubmitRubro(): void {
    if (this.headingForm.valid) {
      const rubro = this.headingForm.value;
      this.loading = true;
      if (this.isEditMode) {
        this.rubroService.actualizarRubro(rubro).subscribe({
          next: () => {
            this.snackBar.open('Rubro actualizado con éxito.', 'Cerrar', { duration: 3000 });
            this.listarRubrosEmpresa();
            this.resetForm();
          },
          complete: () => (this.loading = false),
        });
      } else {
        this.rubroService.agregarRubro(rubro).subscribe({
          next: () => {
            this.snackBar.open('Rubro agregado con éxito.', 'Cerrar', { duration: 3000 });
            this.listarRubrosEmpresa();
            this.resetForm();
          },
          complete: () => (this.loading = false),
        });
      }
    }
  }

  private resetForm(): void {
    this.isEditMode = false;
  }
}
