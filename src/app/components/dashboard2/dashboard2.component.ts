import { Component, OnInit } from '@angular/core';
import { Empresa } from '../../models/empresa';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { EmpresaService } from '../../services/empresa.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Rubro } from '../../models/rubro';
import { RubroService } from '../../services/rubro.service';

@Component({
  selector: 'app-dashboard2',
  templateUrl: './dashboard2.component.html',
  styleUrl: './dashboard2.component.scss'
})
export class Dashboard2Component implements OnInit{
  empresaForm: FormGroup = new FormGroup({});
  empresa: Empresa = new Empresa();
  usuarios: Usuario[] = [];
  username: string = '';
  loading: boolean = false;
  fotoPreview: string | ArrayBuffer | null = null;
  rubros: Rubro[] = [];
  usuarioIdLogueado: number = 0;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private rubroService: RubroService,
    private snackBar: MatSnackBar
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.initializeForms();
    this.cargarRubros();
    this.cargarUsuarios();
  }

  initializeForms() {
    this.empresaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      rubroNombre: ['', Validators.required],
      ruc: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      logotipoBase64: ['', Validators.required],
      usuarioNombre: [{ value: this.username, disabled: true }]  // Mostrar el username logueado
    });
  }

  cargarRubros(): void {
    this.rubroService.listarRubros().subscribe(rub => {
      this.rubros = rub;
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.listarTodos().subscribe(usuarios => {
      this.usuarios = usuarios;
      const usuarioLogueado = this.usuarios.find(u => u.username === this.username);
      if (usuarioLogueado) {
        this.usuarioIdLogueado = usuarioLogueado.id;
        this.cargarDatosEmpresa();
      } else {
        this.snackBar.open('Usuario no encontrado.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarDatosEmpresa(): void {
    this.empresaService.EmpresaPorUsuarioId(this.usuarioIdLogueado).subscribe({
      next: (empresa) => {
        if (empresa) {
          this.empresa = empresa;
          this.isEditing = true;
          this.empresaForm.patchValue({
            nombre: empresa.nombre,
            rubroNombre: this.rubros.find(r => r.id === empresa.rubroId)?.nombreRubro || '',
            ruc: empresa.ruc,
            telefono: empresa.telefono,
            logotipoBase64: empresa.logotipoBase64
          });
          this.fotoPreview = 'data:image/png;base64,' + empresa.logotipoBase64;
        }
      },
    });
  }  

  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; 
      if (file.size > maxSize) {
        this.snackBar.open('El tamaño del logotipo excede el límite máximo permitido de 2MB.', 'Cerrar', { duration: 5000 });
        return;
      }
      const validFormats = ['image/png', 'image/jpeg'];
      if (!validFormats.includes(file.type)) {
        this.snackBar.open('Formato de logotipo inválido. Solo se aceptan PNG y JPG.', 'Cerrar', { duration: 5000 });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (controlName === 'logotipoBase64') {
          this.fotoPreview = reader.result;
        }
        this.empresaForm.patchValue({ [controlName]: reader.result?.toString().split(',')[1] });
      };
      reader.readAsDataURL(file);
    }
  }  

  onSubmitEmpresa(): void {
    if (this.isEditing) {
      this.actualizarEmpresa();
    } else {
      this.registrarEmpresa();
    }
  }

  registrarEmpresa(): void {
    if (this.empresaForm.invalid || !this.fotoPreview) {
      this.snackBar.open('Por favor complete todos los campos.', 'Cerrar', { duration: 3000 });
      return;
    }
  
    this.loading = true;
  
    setTimeout(() => {
      const empresa = new Empresa();
      this.asignarValoresEmpresa(empresa);
      empresa.usuarioId = this.usuarioIdLogueado;
  
      this.empresaService.agregarEmpresa(empresa).subscribe({
        next: () => this.manejarRespuestaRegistro('Empresa registrada exitosamente.'),
        error: () => this.manejarRespuestaRegistro('Error al registrar la empresa.', true)
      });
    }, 3000);
  }

  actualizarEmpresa(): void {
    this.loading = true;
  
    setTimeout(() => {
      const empresaActualizada = new Empresa();
      this.asignarValoresEmpresa(empresaActualizada);
  
      empresaActualizada.usuarioId = this.usuarioIdLogueado;
      empresaActualizada.id = this.empresa.id;
  
      this.empresaService.actualizarEmpresa(empresaActualizada).subscribe({
        next: () => this.manejarRespuestaRegistro('Perfil actualizado exitosamente.'),
        error: () => this.manejarRespuestaRegistro('Error al actualizar el perfil.', true)
      });
    }, 3000);
  }  

  asignarValoresEmpresa(empresa: Empresa): void {
    empresa.nombre = this.empresaForm.value.nombre;
    empresa.ruc = this.empresaForm.value.ruc;
    empresa.telefono = this.empresaForm.value.telefono;
    empresa.logotipoBase64 = this.empresaForm.value.logotipoBase64;
    empresa.rubroId = this.rubros.find(r => r.nombreRubro === this.empresaForm.value.rubroNombre)?.id || 0;
  }

  manejarRespuestaRegistro(mensaje: string, isError: boolean = false): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
    if (!isError) {
      this.isEditing = false;
    }
    this.loading = false;
  }
}
