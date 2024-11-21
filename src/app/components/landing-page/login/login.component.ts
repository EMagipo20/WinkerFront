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
            this.snackBar.open('Login successful!', 'Cerrar', {
              duration: 2000,
              panelClass: ['success-snackbar']
            });
          }
        },
        (error) => {
          this.displayMessage('Credenciales incorrectas, intente de nuevo.', 'Error');
        }
      );
    } else {
      this.displayMessage('Por favor, complete el formulario correctamente.', 'Error');
    }
  }

  toggleVisibility() {
    this.hide = !this.hide;
  }
  
  displayMessage(message: string, action: string) {
    this.snackBar.open(message, action, { duration: 2000 });
  }
}