import { Component, OnInit } from '@angular/core';
import { Documento } from '../../../models/documento';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Postulante } from '../../../models/postulante';
import { PostulanteService } from '../../../services/postulante.service';
import { DocumentoService } from '../../../services/documento.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insertupdatedocuments',
  templateUrl: './insertupdatedocuments.component.html',
  styleUrls: ['./insertupdatedocuments.component.scss' ] 
})
export class InsertupdatedocumentsComponent implements OnInit {
  documentoForm: FormGroup = new FormGroup({});
  loading = false;

  //Para visualizar nombre del archivo
  fileName: string = '';

  //Para especificar archivo
  isOtroTipoVisible = false; 

  // Listar postulantes
  postulantes: Postulante[] = [];

  documento: Documento | null = null;

  // Variable para verificar si estamos en modo edición
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private postulanteService: PostulanteService,
    private documentoService: DocumentoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.initializeForms();
    this.cargarPostulante();
    this.documento = history.state.documento;
    if (this.documento) {
      this.isEditing = true;
      this.cargarDatosEnFormulario(this.documento);
    }
  }

  initializeForms() {
    this.documentoForm = this.fb.group({
      tipo: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      tipoEspecificar: ['', Validators.required],
      archivoBase64: ['', Validators.required],
      postulanteId: ['', Validators.required],
    });
  }

  cargarPostulante(): void {
    this.postulanteService.listarPostulantes().subscribe(pos => {
      this.postulantes = pos;
    });
  }

  cargarDatosEnFormulario(documento: Documento) {
    this.documentoForm.patchValue(documento);
    this.fileName = documento.tipo;
  }

  onTipoChange(selectedValue: string): void {
    this.isOtroTipoVisible = selectedValue === 'Otro';
    if (!this.isOtroTipoVisible) {
      this.documentoForm.patchValue({ tipoEspecificar: '' }); 
    }
    this.documentoForm.get('tipoEspecificar')?.clearValidators();
    if (this.isOtroTipoVisible) {
      this.documentoForm.get('tipoEspecificar')?.setValidators([Validators.required]);
    }
    this.documentoForm.get('tipoEspecificar')?.updateValueAndValidity();
  }

  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
  
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      const allowedFormats = ['application/pdf'];
  
      // Validar el tamaño del archivo
      if (file.size > maxSize) {
        this.openSnackbar('El tamaño del archivo excede el límite máximo permitido de 5MB.', 'warning');
        this.fileName = '';
        this.documentoForm.patchValue({ [controlName]: '' });
        return;
      }
  
      if (!allowedFormats.includes(file.type)) {
        this.openSnackbar('Formato de archivo inválido. Solo se aceptan PDF.', 'error');
        this.fileName = ''; 
        this.documentoForm.patchValue({ [controlName]: '' }); 
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.documentoForm.patchValue({ 
          [controlName]: reader.result?.toString().split(',')[1] 
        });
        this.fileName = file.name;
      };
      reader.readAsDataURL(file);
    }
  }    
  
  registrarDocumento(): void {
    if (this.documentoForm.invalid) {
      this.openSnackbar('Por favor, complete todos los campos requeridos.', 'warning');
      return;
    }

    this.loading = true;

    const documento = new Documento();
    this.asignarValoresDocumento(documento);
    if (this.isEditing) {
      this.documentoService.actualizarDocumento(documento).subscribe({
        next: () => this.manejarRespuestaRegistro('Documento actualizado correctamente.', 'success'),
        error: () => this.manejarRespuestaRegistro('Error al actualizar el documento.', 'error')
      });
    } else {
      this.documentoService.agregarDocumento(documento).subscribe({
        next: () => this.manejarRespuestaRegistro('Documento agregado correctamente.', 'success'),
        error: () => this.manejarRespuestaRegistro('Error al agregar el documento.', 'error')
      });
    }
  }

  asignarValoresDocumento(documento: Documento): void {
    if (this.isEditing && this.documento) {
      documento.id = this.documento.id;
    }
    documento.tipo = this.documentoForm.value.tipo === 'Otro' ? this.documentoForm.value.tipoEspecificar : this.documentoForm.value.tipo;
    documento.fechaCarga = new Date();
    documento.archivoBase64 = this.documentoForm.value.archivoBase64;
    documento.postulanteId = this.documentoForm.value.postulanteId; 
  }
  
  manejarRespuestaRegistro(mensaje: string, type: 'success' | 'error'): void {
    this.openSnackbar(mensaje, type);
    if (type === 'success') {
      this.router.navigate(['/sidenav-postulante/documents/listdeletedocuments']);
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
