import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Menu de navegacion
import { SidenavEmpresaComponent } from './components/sidenav-empresa/sidenav.component';
import { SidenavPostulanteComponent } from './components/sidenav-postulante/sidenav.component';
import { Dashboard2Component } from './components/dashboard2/dashboard2.component';
import { segGuard } from './guards/seguridad.guard';
import { InsertupdateoffersComponent } from './components/offers/insertupdateoffers/insertupdateoffers.component';
import { OffersComponent } from './components/offers/offers.component';
import { ListdeleteoffersComponent } from './components/offers/listdeleteoffers/listdeleteoffers.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ListOffersPostulanteComponent } from './components/offers/listofferspostulante/listofferspostulante.component';
import { TypeWorkComponent } from './components/typeWork/typeWork.component';
import { EnterpriceComponent } from './components/enterprice/enterprice.component';
import { LocationOfferComponent } from './components/locationOffer/locationOffer.component';
import { HeadingComponent } from './components/heading/heading.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { InsertupdatedocumentsComponent } from './components/documents/insertupdatedocuments/insertupdatedocuments.component';
import { ListdeletedocumentsComponent } from './components/documents/listdeletedocuments/listdeletedocuments.component';
import { JobApplicationsComponent } from './components/job-applications/job-applications.component';
import { AcceptedApplicationsComponent } from './components/job-applications/accepted-applications/accepted-applications.component';
import { ListApplicationsComponent } from './components/job-applications/listapplications/listapplications.component';
import { ResponderPostComponent } from './components/responderpost/responderpost.component';
import { ListallapplicationsComponent } from './components/job-applications/listallapplications/listallapplications.component';
import { AboutComponent } from './components/landing-page/about/about.component';
import { ContactComponent } from './components/landing-page/contact/contact.component';
import { IndexComponent } from './components/landing-page/index/index.component';
import { RegisterComponent } from './components/landing-page/register/register.component';
import { LoginComponent } from './components/landing-page/login/login.component';
import { GeneralReportsComponent } from './components/general-reports/general-reports.component';
import { ReportsComponent } from './components/general-reports/reports/reports.component';
import { ReportLocationComponent } from './components/general-reports/report-location/report-location.component';

const routes: Routes = [
    { 
        path: '', redirectTo: '/index', pathMatch: 'full' 
    },
    {
        path: 'about', component: AboutComponent
    },
    {
        path: 'contact',component: ContactComponent
    },
    {
        path: 'index', component: IndexComponent
    },
    {
        path: 'register', component: RegisterComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'sidenav-empresa', component: SidenavEmpresaComponent,
        children: [
            { path: 'dashboard2', component: Dashboard2Component, canActivate: [segGuard]},

            { path: 'heading', component: HeadingComponent, canActivate: [segGuard]},

            { path: 'offers', component: OffersComponent, children:[
                { path: 'insertupdateoffers', component: InsertupdateoffersComponent },
                { path: 'listdeleteoffers', component: ListdeleteoffersComponent }
            ],canActivate: [segGuard]},

            { path: 'typeWork', component: TypeWorkComponent, canActivate: [segGuard]},

            { path: 'locationOffer', component: LocationOfferComponent, canActivate: [segGuard]},

            { path: 'responderpost', component: ResponderPostComponent, canActivate: [segGuard]},

            { path: 'job-applications', component: JobApplicationsComponent, 
                children: [
                    { path: 'accepted-applications', component: AcceptedApplicationsComponent },
                    { path: 'listapplications', component: ListApplicationsComponent }
                ], canActivate: [segGuard]},
            { path: 'general-reports', component: GeneralReportsComponent,
                children: [
                    { path: 'reports', component: ReportsComponent },
                    { path: 'report-location', component: ReportLocationComponent }

                ], canActivate: [segGuard]},
            { path: 'settings', component: SettingsComponent, canActivate: [segGuard]},
        ]
    },
    {
        path: 'sidenav-postulante', component: SidenavPostulanteComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent, canActivate: [segGuard]},

            { path: 'documents', component: DocumentsComponent, children: [
                { path: 'insertupdatedocuments', component: InsertupdatedocumentsComponent },
                { path: 'listdeletedocuments', component: ListdeletedocumentsComponent }
            ], canActivate: [segGuard]},

            { path: 'offers', component: OffersComponent, children:[
                { path: 'listofferspostulante', component: ListOffersPostulanteComponent }
            ],canActivate: [segGuard]},

            { path: 'favorites', component: FavoritesComponent, canActivate: [segGuard]},

            { path: 'enterprice', component: EnterpriceComponent, canActivate: [segGuard]},

            { path: 'job-applications', component: JobApplicationsComponent, 
                children: [
                    { path: 'listallapplications', component: ListallapplicationsComponent }
                ], canActivate: [segGuard]},

            { path: 'settings', component: SettingsComponent, canActivate: [segGuard]}
        ]
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }