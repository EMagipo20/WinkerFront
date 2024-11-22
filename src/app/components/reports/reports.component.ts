import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit{

  constructor(private reporteService: ReportesService) {}

  ngOnInit(): void {
  }
}
