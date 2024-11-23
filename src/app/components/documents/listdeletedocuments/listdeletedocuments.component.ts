import { Component, OnInit } from '@angular/core';
import { Documento } from '../../../models/documento';
import { Postulante } from '../../../models/postulante';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentoService } from '../../../services/documento.service';
import { PostulanteService } from '../../../services/postulante.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../confirme-delete/delete.component';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-listdeletedocuments',
  templateUrl: './listdeletedocuments.component.html',
  styleUrl: './listdeletedocuments.component.scss'
})
export class ListdeletedocumentsComponent implements OnInit {
  documentos: Documento[] = [];
  postulantes: Postulante[] = [];
  loading = false;
  username: string = '';
  postulanteId: number = 0;
  anioSeleccionado: number | null = null;
  mesSeleccionado: number | null = null;
  displayedColumns: string[] = ['id', 'tipo', 'fechaCarga', 'postulanteNombre', 'acciones'];

  constructor(
    private snackBar: MatSnackBar,
    private documentoService: DocumentoService,
    private postulanteService: PostulanteService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.cargarPostulantes();
  }

  cargarPostulantes(): void {
    this.postulanteService.listarPostulantes().subscribe(postulantes => {
      this.postulantes = postulantes;
      this.obtenerPostulanteId();
    });
  }

  obtenerPostulanteId(): void {
    if (!this.username) {
      this.openSnackbar('No hay usuario logeado', 'warning');
      return;
    }
    this.usuarioService.listarTodos().subscribe(usuarios => {
      const usuarioLogueado = usuarios.find(u => u.username === this.username);

      if (usuarioLogueado) {
        const postulanteLogueado = this.postulantes.find(p => p.usuarioId === usuarioLogueado.id);
        
        if (postulanteLogueado) {
          this.postulanteId = postulanteLogueado.id;
          this.cargarDocumentos(this.postulanteId);
        } else {
          this.openSnackbar('Postulante no encontrado', 'warning');
        }
      } else {
        this.openSnackbar('Usuario no encontrado', 'warning');
      }
    });
  }

  cargarDocumentos(postulanteId: number): void {
    this.loading = true;
    this.documentoService.listarDocumentosPorPostulante(postulanteId).subscribe({
      next: (docs) => {
        this.documentos = docs
          .map(d => ({
            ...d,
            postulanteNombre: this.postulantes.find(p => p.id === d.postulanteId)?.nombreCompleto || 'Postulante desconocido',
          }))
          .sort((a, b) => a.id - b.id); 
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.openSnackbar('Error al cargar documentos.', 'error');
      }
    });
  }

  eliminarDocumento(id: number): void {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.documentoService.eliminarDocumento(id).subscribe({
          next: () => {
            this.cargarDocumentos(this.postulanteId); 
            this.openSnackbar('Documento eliminado correctamente', 'success');
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.openSnackbar('Error al eliminar el documento', 'error');
          }
        });
      }
    });
  }

  cargarDocumentosPorMesYAnio(): void {
    if (this.anioSeleccionado && this.mesSeleccionado) {
      this.loading = true;
      this.documentoService.getDocumentosPorMesYAnio(this.anioSeleccionado, this.mesSeleccionado).subscribe({
        next: (docs) => {
          this.documentos = docs
            .map(d => ({
              ...d,
              postulanteNombre: this.postulantes.find(p => p.id === d.postulanteId)?.nombreCompleto || 'Postulante desconocido',
            }))
            .sort((a, b) => a.id - b.id); 
          if (this.documentos.length === 0) {
            this.openSnackbar('No hay documentos disponibles para el mes y año seleccionados.', 'warning');
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.openSnackbar('Error al cargar documentos por mes y año.', 'error');
        }
      });
    }
  }

  verDocumento(documento: Documento): void {
    const byteCharacters = atob(documento.archivoBase64);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const blobUrl = URL.createObjectURL(blob);
  
    window.open(blobUrl, '_blank');
  
    URL.revokeObjectURL(blobUrl);
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
