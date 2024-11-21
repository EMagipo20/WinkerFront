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
      this.snackBar.open('No hay usuario logeado', 'Cerrar', { duration: 3000 });
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
          this.snackBar.open('Postulante no encontrado', 'Cerrar', { duration: 3000 });
        }
      } else {
        this.snackBar.open('Usuario no encontrado', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open('Error al cargar documentos.', 'Cerrar', { duration: 3000 });
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
            this.snackBar.open('Documento eliminado correctamente', 'Cerrar', { duration: 3000 });
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.snackBar.open('Error al eliminar el documento', 'Cerrar', { duration: 3000 });
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
            this.snackBar.open('No hay documentos disponibles para el mes y año seleccionados.', 'Cerrar', { duration: 3000 });
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar documentos por mes y año.', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  verDocumento(documento: Documento): void {
    const byteCharacters = atob(documento.archivoBase64);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
  
    // Crea una URL para el Blob
    const blobUrl = URL.createObjectURL(blob);
  
    // Abre el archivo PDF en una nueva ventana
    window.open(blobUrl, '_blank');
  
    // Libera la URL del Blob después de abrirla
    URL.revokeObjectURL(blobUrl);
  }
}
