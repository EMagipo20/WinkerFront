import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { Observable } from 'rxjs';
import { ReportedemandaVSoferta } from '../models/reporte-1';
import { ReporteUbicacion } from '../models/reporte-2';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ReportesService {
  private baseUrl = `${environment.wBase}/Reportes`;
  constructor(private http: HttpClient) { }
  
  obtenerDemandaVsOferta(): Observable<ReportedemandaVSoferta[]> {
    return this.http.get<ReportedemandaVSoferta[]>(`${this.baseUrl}/demanda-vs-oferta`);
  }

  obtenerReportePorDireccionCompleta(): Observable<ReporteUbicacion[]> {
    return this.http.get<ReporteUbicacion[]>(`${this.baseUrl}/ubicacion-completa`);
  }
}
