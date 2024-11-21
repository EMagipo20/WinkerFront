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

    console.log("Datos del post a enviar:", this.post);

    this.postService.agregarPost(this.post).subscribe({
      next: () => {
        this.snackBar.open('Post enviado exitosamente.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close();
      },
      error: () => {
        this.snackBar.open('Error al enviar el post.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
