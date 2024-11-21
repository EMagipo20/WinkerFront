import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-register',
  templateUrl:'./register.component.html',
  styleUrl:'./register.component.scss'
})
export class RegisterComponent implements OnInit {

  public usuarioForm: FormGroup = new FormGroup({});
  errorMessage: string = '';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.usuarioForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('^[A-Z].*'),
        Validators.pattern('.*[!@#$%^&*(),.?":{}|<>].*') 
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('.*[0-9].*') 
      ]],
      enabled: ['', Validators.required],
      rol: ['', Validators.required]
    });
  }

  registrarUsuario(): void {
    if (this.usuarioForm.valid) {
      const nuevoUsuario: Usuario = this.usuarioForm.value;
      const rolNombre: string = this.usuarioForm.get('rol')?.value;

      // Modifica esta llamada para pasar el nombre del rol
      this.usuarioService.crear(nuevoUsuario, rolNombre).subscribe({
        next: (data) => {
          this.snackBar.open('Usuario registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/login']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          this.errorMessage = error;
          this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}