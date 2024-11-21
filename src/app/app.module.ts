import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AngularMaterialModule } from './shared/angular-material/angular-material.module';
import { AppComponent } from './app.component';
import { SublevelMenuComponent } from './components/sidenav-empresa/sublevel-menu.component';
import { SidenavEmpresaComponent } from './components/sidenav-empresa/sidenav.component';

import { HttpClientModule } from '@angular/common/http';
import { JwtModule, JwtModuleOptions } from '@auth0/angular-jwt';
import { SidenavPostulanteComponent } from './components/sidenav-postulante/sidenav.component';
import { Sublevel2MenuComponent } from './components/sidenav-postulante/sublevel2-menu.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { Dashboard2Component } from './components/dashboard2/dashboard2.component';
import { InsertupdateoffersComponent } from './components/offers/insertupdateoffers/insertupdateoffers.component';
import { DeleteComponent } from './components/confirme-delete/delete.component';
import { ListdeleteoffersComponent } from './components/offers/listdeleteoffers/listdeleteoffers.component';
import { ListOffersPostulanteComponent } from './components/offers/listofferspostulante/listofferspostulante.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { TypeWorkComponent } from './components/typeWork/typeWork.component';
import { LocationOfferComponent } from './components/locationOffer/locationOffer.component';
import { HeadingComponent } from './components/heading/heading.component';
import { EnterpriceComponent } from './components/enterprice/enterprice.component';
import { InsertupdatedocumentsComponent } from './components/documents/insertupdatedocuments/insertupdatedocuments.component';
import { ListdeletedocumentsComponent } from './components/documents/listdeletedocuments/listdeletedocuments.component';
import { DetailsOfferComponent } from './components/details-offer/details-offer';
import { JobApplicationsComponent } from './components/job-applications/job-applications.component';
import { DetailsPostulantComponent } from './components/details-postulant/details-postulant.component';
import { AcceptedApplicationsComponent } from './components/job-applications/accepted-applications/accepted-applications.component';
import { ListApplicationsComponent } from './components/job-applications/listapplications/listapplications.component';
import { PostComponent } from './components/post/post.component';
import { ResponderPostComponent } from './components/responderpost/responderpost.component';
import { ListallapplicationsComponent } from './components/job-applications/listallapplications/listallapplications.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LeadingComment } from '@angular/compiler';
import { AboutComponent } from './components/landing-page/about/about.component';
import { ContactComponent } from './components/landing-page/contact/contact.component';
import { IndexComponent } from './components/landing-page/index/index.component';
import { RegisterComponent } from './components/landing-page/register/register.component';
import { LoginComponent } from './components/landing-page/login/login.component';
export function tokenGetter() {
  return sessionStorage.getItem('token');
}

const jwtModuleOptions: JwtModuleOptions = {
  config: {
    tokenGetter: tokenGetter,
    allowedDomains: ['localhost:8080'],
    disallowedRoutes: [
      'http://localhost:8080/Usuarios/Agregar',
      'http://localhost:8080/roles/Agregar',
      'http://localhost:8080/login'
    ],
  },
};

@NgModule({
  declarations: [
    AppComponent, 
    SidenavEmpresaComponent,
    SublevelMenuComponent,
    SidenavPostulanteComponent,
    Sublevel2MenuComponent,
    DashboardComponent,
    Dashboard2Component,
    InsertupdateoffersComponent,
    ListdeleteoffersComponent,
    HeadingComponent,
    ListOffersPostulanteComponent,
    TypeWorkComponent,
    DeleteComponent,
    FavoritesComponent,
    EnterpriceComponent,
    LocationOfferComponent,
    InsertupdatedocumentsComponent,
    ListdeletedocumentsComponent,
    DetailsOfferComponent,
    ListApplicationsComponent,
    ListallapplicationsComponent,
    DetailsPostulantComponent,
    AcceptedApplicationsComponent,
    PostComponent,
    ResponderPostComponent,
    SettingsComponent, 
    AboutComponent,
    ContactComponent,
    IndexComponent,
    RegisterComponent, 
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    JwtModule.forRoot(jwtModuleOptions),
  ],
  providers: [
  ],
  bootstrap: [AppComponent ]
})
export class AppModule { }