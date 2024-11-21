import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { OfertaEmpleoService } from '../../../services/ofertaEmpleo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmpresaService } from '../../../services/empresa.service';
import { TipoTrabajoService } from '../../../services/tipoTrabajo.service';
import { UbicacionOfertaService } from '../../../services/ubicacionOferta.service';
import { TipoTrabajo } from '../../../models/tipoTrabajo';
import { Empresa } from '../../../models/empresa';
import { UbicacionOferta } from '../../../models/ubicacionOferta';
import { OfertaEmpleo } from '../../../models/ofertaEmpleo';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insertupdateoffers',
  templateUrl: './insertupdateoffers.component.html',
  styleUrls: ['./insertupdateoffers.component.scss']
})
export class InsertupdateoffersComponent implements OnInit {
  ofertaForm: FormGroup;
  loading = false;

  tiposTrabajos: TipoTrabajo[] = [];

  empresas: Empresa[] = [];
  ubicaciones: UbicacionOferta[] = [];

  fechaPublicacion: Date = new Date();

  ofertas: OfertaEmpleo | null = null;

  //Variable para verificar si estamos en modo edición
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private tipotrabajoService: TipoTrabajoService,
    private ubicacionService: UbicacionOfertaService,
    private ofertaEmpleoService: OfertaEmpleoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    const fechaActual = new Date();
    
    this.ofertaForm = this.fb.group({
      tituloTrabajo: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      descripcion: ['', [Validators.required, Validators.pattern('[a-zA-Z,. ]*')]],
      salario: ['', [Validators.required, Validators.min(1)]],
      fechaPublicacion: [{ value: fechaActual, disabled: true }],
      fechaVencimiento: ['', [Validators.required, this.fechaVencimientoValida()]],
      indActivo: [false, Validators.required],
      tipoTrabajoId: ['', Validators.required],
      empresaId: ['', Validators.required],
      ubicacionOfertaId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarTiposTrb();
    this.cargarEmpresa();
    this.cargarUbicacion();
    this.ofertas = history.state.oferta;
    if (this.ofertas) {
      this.isEditing = true;
      this.cargarDatosEnFormulario(this.ofertas);
    }
  }

  cargarTiposTrb(): void {
    this.tipotrabajoService.listarTipoTrabajos().subscribe(typeWorks => {
      this.tiposTrabajos = typeWorks;
    });
  }

  cargarEmpresa(): void {
    this.empresaService.listarEmpresas().subscribe(empresas => {
      this.empresas = empresas;
    });
  }

  cargarUbicacion(): void {
    this.ubicacionService.listarUbicaciones().subscribe(ubis => {
      this.ubicaciones = ubis;
    });
  }

  cargarDatosEnFormulario(of: OfertaEmpleo) {
    this.ofertaForm.patchValue({
      ...of,
      fechaPublicacion: of.fechaPublicacion || new Date()
    });
  }

  fechaVencimientoValida(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const fechaVencimiento = new Date(control.value);
      return fechaVencimiento >= this.fechaPublicacion ? null : { 'fechaInvalida': 'La fecha de vencimiento no puede ser anterior a la fecha de publicación' };
    };
  }

  registrarOferta(): void {
    if (this.ofertaForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.isEditing) {
      this.actualizarOferta();
    } else {
      const oferta = this.ofertaForm.value;
      oferta.fechaPublicacion = new Date();
      this.ofertaEmpleoService.agregarOferta(oferta).subscribe({
        next: () => {
          this.snackBar.open('Oferta de empleo registrada exitosamente.', 'Cerrar', { duration: 3000 });
          this.loading = false;
          this.ofertaForm.get('fechaVencimiento')?.setValue(new Date());
        },
        error: () => {
          this.snackBar.open('Error al registrar la oferta.', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  actualizarOferta(): void {
    const oferta = this.ofertaForm.value;
    oferta.id = this.ofertas?.id;
    oferta.fechaPublicacion = new Date();

    this.ofertaEmpleoService.actualizarOferta(oferta).subscribe({
      next: () => {
        this.snackBar.open('Oferta de empleo actualizada exitosamente.', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.isEditing = false;
        this.ofertaForm.reset();
        this.router.navigate(['/sidenav-empresa/offers/listdeleteoffers']);
      },
      error: () => {
        this.snackBar.open('Error al actualizar la oferta.', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
