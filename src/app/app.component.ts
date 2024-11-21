import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'WinkerFronted';

  toolbarTitle: string = '';
  PrimeraParte: string = '';
  segundaParte: string = '';
  role: string = '';
  sub: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateToolbarTitle();
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const toolbar = document.querySelector('.custom-toolbar');
    const routerOutlet = document.querySelector('.router-outlet');

    if (window.pageYOffset > 40) {
      toolbar?.classList.add('sticky');
      routerOutlet?.classList.add('sticky-content');
    } else {
      toolbar?.classList.remove('sticky');
      routerOutlet?.classList.remove('sticky-content');
    }
  }

  updateToolbarTitle(): void {
    const urlParts = this.router.url.split('/');
    this.PrimeraParte = urlParts.length > 1 ? urlParts[1] : '';
    this.segundaParte = urlParts.length > 2 ? urlParts[2] : '';

    // Postulante y Empresa
    switch (this.segundaParte) {
      case 'dashboard':
      case 'dashboard2':
        this.toolbarTitle = 'Panel de inicio';
        break;
      case 'documents':
        this.toolbarTitle = 'Gestion de documentos';
        break;
      case 'offers':
        this.toolbarTitle = 'Ofertas de Empleo';
        break;
      case 'favorites':
        this.toolbarTitle = 'Coleccion de ofertas favoritas';
        break;
      case 'enterprice':
        this.toolbarTitle = 'Base de datos de empresas';
        break;
      case 'settings':
        this.toolbarTitle = 'Configurar perfil de usuario';
        break;
      case 'heading':
        this.toolbarTitle = 'Rubros empresariales';
        break;
      case 'typeWork':
        this.toolbarTitle = 'Modalidad y Jornada Laboral';
        break;
      case 'locationOffer':
        this.toolbarTitle = 'Localizaciones de ofertas laborales';
        break;
      case 'job-applications':
        this.toolbarTitle = 'Gestion de solicitudes';
        break;
      case 'responderpost':
        this.toolbarTitle = 'Preguntas frecuentes';
        break;
    }
  }

  navigateToProfile() {
    this.router.navigate(['/mi-perfil']);
  }

  verificar() {
    this.role = this.authService.showRole();
    this.sub = this.authService.getUsername();
    return this.authService.verificar();
  }

  isPostulante() {
    return this.role === 'POSTULANTE';
  }

  isEmpresa() {
    return this.role === 'EMPRESA';
  }

  cerrar() {
    sessionStorage.clear();
  }

  isSideNavCollapsed = false;
  screenWidth = 0;

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}