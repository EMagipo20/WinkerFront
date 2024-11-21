export class OfertaEmpleo {
    id: number = 0;
    tituloTrabajo: string = '';
    descripcion: string = '';
    salario: number = 0;
    fechaPublicacion: Date = new Date();
    fechaVencimiento: Date = new Date();
    indActivo: boolean = true;
    //clave foranea
    empresaId: number = 0;
    ubicacionOfertaId: number = 0;
    tipoTrabajoId: number = 0;
}