import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Postulante } from '../../models/postulante';
import { PostulanteService } from '../../services/postulante.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'] 
})
export class DashboardComponent implements OnInit {
  postulanteForm: FormGroup = new FormGroup({});
  postulante: Postulante = new Postulante();
  usuarios: Usuario[] = [];
  username: string = '';
  loading: boolean = false;
  usuarioIdLogueado: number = 0;
  fotoPreview: string | ArrayBuffer | null = null;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private postulanteService: PostulanteService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.initializeForms();
    this.cargarUsuarios();
  }

  initializeForms() {
    this.postulanteForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      fotoBase64: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, this.validBirthdate()]],
      direccion: ['', [Validators.required, Validators.pattern('[a-zA-Z,. ]*')]],
      usuarioNombre: [{ value: this.username, disabled: true }] 
    });
  }

  validBirthdate(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const birthdate = new Date(control.value);
      const today = new Date();
      return birthdate >= today ? { 'invalidBirthdate': true } : null;
    };
  }
  
  cargarUsuarios(): void {
    this.usuarioService.listarTodos().subscribe(usuarios => {
      this.usuarios = usuarios;
      const usuarioLogueado = this.usuarios.find(u => u.username === this.username);
      if (usuarioLogueado) {
        this.usuarioIdLogueado = usuarioLogueado.id;
        this.cargarDatosPostulante();
      } else {
        this.openSnackbar('Usuario no encontrado.', 'error');
      }
    });
  }

  cargarDatosPostulante(): void {
    this.postulanteService.PostulantePorUsuarioId(this.usuarioIdLogueado).subscribe({
      next: (postulante) => {
        if (postulante) {
          this.postulante = postulante;
          this.isEditing = true;
          this.postulanteForm.patchValue({
            nombreCompleto: postulante.nombreCompleto,
            correo: postulante.correo,
            telefono: postulante.telefono,
            fechaNacimiento: postulante.fechaNacimiento,
            direccion: postulante.direccion,
            fotoBase64: postulante.fotoBase64
          });
          this.fotoPreview = 'data:image/png;base64,' + postulante.fotoBase64;
        }
      },
    });
  }

  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        this.openSnackbar('El tamaño de la foto excede el límite máximo permitido de 2MB.', 'warning');
        return;
      }

      const validFormats = ['image/png', 'image/jpeg'];
      if (!validFormats.includes(file.type)) {
        this.openSnackbar('Formato de foto inválido. Solo se aceptan PNG y JPG.', 'error');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        if (controlName === 'fotoBase64') {
          this.fotoPreview = reader.result;
        }
        this.postulanteForm.patchValue({ [controlName]: reader.result?.toString().split(',')[1] });
      };
      reader.readAsDataURL(file);
    }
  }  

  onSubmitPostulante(): void {
    if (this.isEditing) {
      this.actualizarPostulante();
    } else {
      this.crearPostulante();
    }
  }

  crearPostulante(): void {
    if (this.postulanteForm.invalid || !this.fotoPreview) {
      this.openSnackbar('Por favor complete todos los campos.', 'warning');
      return;
    }

    this.loading = true;

    setTimeout(() => {
      const postulante = new Postulante();
      this.asignarValoresPostulante(postulante);
      postulante.usuarioId = this.usuarioIdLogueado;

      this.postulanteService.registrar(postulante).subscribe({
        next: () => this.manejarRespuestaRegistro('Postulante registrado exitosamente.', 'success'),
        error: () => this.manejarRespuestaRegistro('Error al registrar al postulante.', 'error'),
      });
    }, 3000);
  }

  actualizarPostulante(): void {
    this.loading = true;

    setTimeout(() => {
      const postulanteActualizado = new Postulante();
      this.asignarValoresPostulante(postulanteActualizado);

      postulanteActualizado.usuarioId = this.usuarioIdLogueado;
      postulanteActualizado.id = this.postulante.id;

      this.postulanteService.actualizar(postulanteActualizado).subscribe({
        next: () => this.manejarRespuestaRegistro('Perfil actualizado exitosamente.', 'success'),
        error: () => this.manejarRespuestaRegistro('Error al actualizar el perfil.', 'error'),
      });
    }, 3000);
  } 

  asignarValoresPostulante(postulante: Postulante): void {
    postulante.nombreCompleto = this.postulanteForm.value.nombreCompleto;
    postulante.correo = this.postulanteForm.value.correo;
    postulante.telefono = this.postulanteForm.value.telefono;
    postulante.fechaNacimiento = this.postulanteForm.value.fechaNacimiento;
    postulante.direccion = this.postulanteForm.value.direccion;
    postulante.fotoBase64 = this.postulanteForm.value.fotoBase64
  }

  manejarRespuestaRegistro(mensaje: string, type: 'success' | 'error'): void {
    this.openSnackbar(mensaje, type);
    if (type === 'success') {
      this.isEditing = false;
    }
    this.loading = false;
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
