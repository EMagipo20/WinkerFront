export class Post{
    id: number = 0;
    pregunta: string = '';
    respuesta: string = '';
    fechaPublicacion?: Date = new Date;
    disponible: boolean = true;
    //Clave foranea
    postulanteId: number = 0;
    ofertaEmpleoId: number = 0;
}