export class Postulante {
    id: number = 0;
    nombreCompleto: string = '';
    correo: string = '';
    telefono: string = '';
    fotoBase64: string = '';
    fechaNacimiento: Date = new Date();
    direccion: string = '';
    //Clave foranea
    usuarioId: number = 0;
}