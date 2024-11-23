import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../../../services/reportes.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexDataLabels,
  ApexTheme,
  ApexFill,
  ApexStroke,
  ApexGrid,
  ApexLegend,
} from 'ng-apexcharts';
import { Router } from '@angular/router';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  theme: ApexTheme;
  fill: ApexFill;
  stroke: ApexStroke;
  grid: ApexGrid;
  legend: ApexLegend;
};

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  public chartOptions: ChartOptions;

  isLoading: boolean = true;
  error: string | null = null;

  constructor(private reportesService: ReportesService, private router: Router) {
    this.chartOptions = {
      series: [
        { name: 'Ofertas Activas', data: [] },
        { name: 'Postulantes Interesados', data: [] },
      ],
      chart: {
        type: 'bar',
        height: 350,
        width: 950,
        background: 'rgba(255, 255, 255, 0.9)',
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: '#000000',
            fontSize: '12px',
          },
        },
      },
      title: {
        text: 'Demanda vs Oferta por Rubro',
        align: 'center',
        offsetY: 15,
        style: {
          color: '#000000', 
          fontSize: '16px',
          fontFamily: 'Roboto',
          fontWeight: '500',
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#000000'],
        },
      },
      theme: {
        mode: 'light',
      },
      fill: {
        opacity: 0.9,
      },
      stroke: {
        show: true,
        colors: ['#000000'],
        width: 1,
      },
      grid: {
        borderColor: '#000000',
        strokeDashArray: 4,
      },
      legend: {
        labels: {
          colors: '#000000',
        },
      },
    };
  }

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.reportesService.obtenerDemandaVsOferta().subscribe({
      next: (data) => {
        this.isLoading = false;

        const rubros = data.map((item) => item.rubro);
        const ofertasActivas = data.map((item) => item.ofertasActivas);
        const postulantesInteresados = data.map((item) => item.postulantesInteresados);

        this.chartOptions.series = [
          { name: 'Ofertas Activas', data: ofertasActivas },
          { name: 'Postulantes Interesados', data: postulantesInteresados },
        ];
        this.chartOptions.xaxis.categories = rubros;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Error al cargar el reporte. Intente nuevamente.';
        console.error('Error al obtener los datos del servicio:', err);
      },
    });
  }

  navegarAReporte2(): void {
    this.router.navigate(['/report-location']);
  }
}
