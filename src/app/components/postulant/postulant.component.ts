import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-postulant',
  standalone: true,
  imports: [ 
    RouterOutlet 
  ],
  templateUrl: './postulant.component.html',
  styleUrl: './postulant.component.scss'
})
export class PostulantComponent {

}
