import { Usuario } from "./usuario";

export class Empresa{
    id: number = 0;
    nombre: string = '';
    ruc: string = '';
    telefono: string = '';
    logotipoBase64: string = '';
    //clave foranea
    usuarioId: number = 0;
    rubroId: number = 0;
}