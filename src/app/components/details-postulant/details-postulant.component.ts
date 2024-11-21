import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-details-postulant',
  templateUrl: './details-postulant.component.html',
  styleUrl: './details-postulant.component.scss'
})
export class DetailsPostulantComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public postulante: any,
    private dialogRef: MatDialogRef<DetailsPostulantComponent>
  ) {}

  cerrarDialogo(): void {
    this.dialogRef.close();
  }
}
