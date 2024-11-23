import { Component } from '@angular/core';
import { Post } from '../../models/post';
import { MatDialogRef } from '@angular/material/dialog';
import { PostService } from '../../services/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  post: Post = new Post();

  constructor(
    public dialogRef: MatDialogRef<PostComponent>,
    private postService: PostService,
    private snackBar: MatSnackBar
  ) {}

  enviarPost(): void {
    this.post.respuesta = ''; 
    this.post.disponible = true;
    this.post.fechaPublicacion = new Date();
    this.postService.agregarPost(this.post).subscribe({
      next: () => {
        this.openSnackbar('Post enviado exitosamente.', 'success');
        this.dialogRef.close();
      },
      error: () => {
        this.openSnackbar('Error al enviar el post.', 'error');
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
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
