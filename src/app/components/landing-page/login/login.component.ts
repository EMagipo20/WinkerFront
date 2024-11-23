import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { JwtRequest } from '../../../models/jwtRequest';

@Component({
  selector: 'app-login',
  templateUrl:'./login.component.html',
  styleUrls:['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private loginService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  username: string = '';
  password: string = '';
  hide = true;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]]
    });
  }

  login() {
    if (this.loginForm.valid) {
      const request: JwtRequest = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      };
  
      this.loginService.login(request).subscribe(
        (data: any) => {
          sessionStorage.setItem('token', data.jwttoken);
          const role = this.loginService.showRole();
          if (role === 'POSTULANTE') {
            this.router.navigate(['sidenav-postulante/dashboard']);
          } else if (role === 'EMPRESA') {
            this.router.navigate(['sidenav-empresa/dashboard2']);
          } else {
            this.openSnackbar('Inicio de sesión exitoso.', 'success');
          }
        },
        (error) => {
          this.openSnackbar('Credenciales incorrectas, intente de nuevo.', 'error');
        }
      );
    } else {
      this.openSnackbar('Por favor, complete el formulario correctamente.', 'warning');
    }
  }

  toggleVisibility() {
    this.hide = !this.hide;
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