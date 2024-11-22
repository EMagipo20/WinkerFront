import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Rubro } from '../../models/rubro';
import { RubroService } from '../../services/rubro.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../confirme-delete/delete.component';

@Component({
  selector: 'app-heading',
  templateUrl: './heading.component.html',
  styleUrl: './heading.component.scss'
})
export class HeadingComponent implements OnInit{
  headingForm: FormGroup = new FormGroup({});
  rubro: Rubro = new Rubro();

  // listar rubros
  rub: Rubro[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];

  // elemento de carga
  loading = false;

  // variable para verificar si es una actualización
  isEditMode = false;

  //Variable para almacenar total de rubros
  totalRubros: number = 0;  

  // Propiedad para el término de búsqueda
  searchTerm: string = '';

  constructor(
    private rubroService: RubroService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.listarRubrosEmpresa();
    this.contarRubrosRegistrados();
  }

  private initForm(): void {
    this.headingForm = new FormGroup({
      'id': new FormControl(this.rubro.id),
      'nombreRubro': new FormControl(this.rubro.nombreRubro, Validators.required),
    });
  }

  listarRubrosEmpresa(): void {
    this.loading = true;
    this.rubroService.listarRubros().subscribe({
      next: (ru) => {
        this.rub = ru;
        this.loading = false;
      }
    });
  }

  // Método para editar un tipo de trabajo
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
            this,this.listarRubrosEmpresa();
            this.openSnackbar('Rubro eliminado correctamente', 'success');
            this.loading = false;
          }
        });
      }
    });
  }

  onSubmitRubro(): void {
    if (this.headingForm.valid) {
      this.loading = true;
      const rubros = this.headingForm.value;

      if (this.isEditMode) {
        this.rubroService.actualizarRubro(rubros).subscribe({
          next: () => {
            this.openSnackbar('Rubro actualizado con éxito', 'success');
            this.listarRubrosEmpresa();
            this.resetForm();
            this.loading = false;
          }
        });
      } else {
        this.rubroService.agregarRubro(rubros).subscribe({
          next: () => {
            this.openSnackbar('Rubro agregado con éxito', 'success');
            this.listarRubrosEmpresa();
            this.resetForm();
            this.loading = false;
          }
        });
      }
    }
  }

  contarRubrosRegistrados(): void {
    this.rubroService.contarRubros().subscribe({
      next: (total) => {
        this.totalRubros = total;
      },
      error: () => {
        this.openSnackbar('Error al contar los rubros.', 'error');
      }
    });
  }

  buscarRubro(): void {
    if (this.searchTerm.trim() !== '') {
      this.loading = true;
      this.rubroService.buscarRubroPorNombre(this.searchTerm).subscribe({
        next: (ru) => {
          this.rub = ru;
          this.loading = false;
        },
        error: () => {
          this.openSnackbar('Error al buscar rubros.', 'error');
          this.loading = false;
        }
      });
    } else {
      this.listarRubrosEmpresa();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.listarRubrosEmpresa();
  }


  private resetForm(): void {
    this.headingForm.reset();
    this.isEditMode = false;
  }

  private openSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }  
}
