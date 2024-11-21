import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-details-offer',
  templateUrl: './details-offer.html',
  styleUrl: './details-offer.scss'
})
export class DetailsOfferComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DetailsOfferComponent>
  ) {}

  enviarSolicitud(): void {
    const solicitud = {
      id: 0,
      fechaSolicitud: new Date(),
      estadoSolicitud: 'Pendiente',
      ofertaEmpleoId: this.data.id,
      postulanteId: this.data.postulanteId
    };

    this.dialogRef.close({ enviar: true, solicitud });
  }

  cancelar(): void {
    this.dialogRef.close({ enviar: false });
  }
}
