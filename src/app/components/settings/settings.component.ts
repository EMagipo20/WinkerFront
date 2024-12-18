import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { DeleteComponent } from '../confirme-delete/delete.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  usuarioForm: FormGroup = new FormGroup({});
  loading: boolean = false;
  snackBarMessage: string = '';
  usuarioIdLogueado: number = 0;
  username: string = '';
  isEditMode = false;
  passwordVisible: { [key: string]: boolean } = {
    password: false,
    confirmPassword: false
  };
  fechaRegistroOriginal: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.cargarUsuarioLogueado();
  }

  initializeForm(): void {
    this.usuarioForm = this.fb.group({
      username: ['', this.isEditMode ? [Validators.required, Validators.pattern('^[A-Z][A-Za-z0-9]*[^a-zA-Z0-9]*$')] : []],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern('^(?=.*[a-z])(?=.*\\d)[a-z\\d]+$')]],
      confirmPassword: ['', Validators.required],
      enabled: [false]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  cargarUsuarioLogueado(): void {
    this.usuarioService.listarTodos().subscribe({
      next: (usuarios) => {
        const usuarioLogueado = usuarios.find(u => u.username === this.username);
        if (usuarioLogueado) {
          this.usuarioIdLogueado = usuarioLogueado.id;
          this.fechaRegistroOriginal = new Date(usuarioLogueado.fechaRegistro);
          this.usuarioForm.patchValue({
            username: usuarioLogueado.username,
            enabled: usuarioLogueado.enabled
          });
        } else {
          this.openSnackbar('Usuario no encontrado', 'warning')
        }
      },
      error: () => {
        this.openSnackbar('Error al cargar los datos del usuario', 'error')
      }
    });
  }

  actualizarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.openSnackbar('Por favor complete todos los campos', 'warning')
    }
    this.loading = true;
    const usuarioActualizado: Usuario = {
      id: this.usuarioIdLogueado,
      username: this.usuarioForm.value.username,
      password: this.usuarioForm.value.password,
      enabled: this.usuarioForm.value.enabled,
      fechaRegistro: this.fechaRegistroOriginal
    };
    this.usuarioService.actualizarUsuario(usuarioActualizado).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.openSnackbar('Usuario actualizado exitosamente', 'success')
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(field: string): void {
    this.passwordVisible[field] = !this.passwordVisible[field];
  }

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarCuenta(this.usuarioIdLogueado);
      }
    });
  }

  eliminarCuenta(id: number): void {
    this.loading = true;

    this.usuarioService.eliminar(id).subscribe({
      next: () => {
        this.openSnackbar('Cuenta eliminada correctamente.', 'success');
        this.loading = false;
      },
      error: () => {
        this.openSnackbar('Error al eliminar la cuent.', 'error');
        this.loading = false;
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