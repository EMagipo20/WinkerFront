export class Documento{
    id: number = 0;
    tipo: string = '';
    fechaCarga?: Date = new Date();
    archivoBase64: string = '';
    //Clave foranea
    postulanteId: number = 0;
}