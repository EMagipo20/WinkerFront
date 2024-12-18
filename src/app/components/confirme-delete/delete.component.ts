import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete',
  templateUrl:'./delete.component.html',
  styleUrls: ['./delete.component.scss'] 
})
export class DeleteComponent {
  constructor(public dialogRef: MatDialogRef<DeleteComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
