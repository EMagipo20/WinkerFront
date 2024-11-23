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
  selector: 'app-report-location',
  templateUrl: './report-location.component.html',
  styleUrls: ['./report-location.component.scss'],
})
export class ReportLocationComponent implements OnInit {
  public chartOptions: ChartOptions;

  isLoading: boolean = true;
  error: string | null = null;

  constructor(private reportesService: ReportesService) {
    this.chartOptions = {
      series: [
        { name: 'Cantidad de Postulantes', data: [] },
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
        text: 'Postulantes por Ubicación',
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
          horizontal: true,
          barHeight: '50%',
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
    this.reportesService.obtenerReportePorDireccionCompleta().subscribe({
      next: (data) => {
        this.isLoading = false;

        const ubicaciones = data.map((item) => item.ubicacion);
        const cantidadPostulantes = data.map((item) => item.cantidadPostulantes);

        this.chartOptions.series = [
          { name: 'Cantidad de Postulantes', data: cantidadPostulantes },
        ];
        this.chartOptions.xaxis.categories = ubicaciones;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Error al cargar el reporte. Intente nuevamente.';
      },
    });
  }
}
