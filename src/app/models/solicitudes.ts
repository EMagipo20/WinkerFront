export class Solicitudes{
    id: number = 0;
    fechaSolicitud?: Date = new Date;
    estadoSolicitud: string = '';
    //Clave foranea
    ofertaEmpleoId: number = 0;
    postulanteId: number = 0;
}