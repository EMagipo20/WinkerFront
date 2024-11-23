import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-general-reports',
  standalone: true,
  imports: [ 
    RouterOutlet 
  ],
  templateUrl: './general-reports.component.html',
  styleUrl: './general-reports.component.scss'
})
export class GeneralReportsComponent {

}
