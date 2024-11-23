import { INavbarData } from "./helper";

export const navbarData: INavbarData[] = [
    {
        routeLink: 'dashboard2',
        icon: 'fal fa-home', // Dashboard
        label: 'Dashboard',
    },
    {
        routeLink: 'heading',
        icon: 'fa fa-industry', // Rubros de empresas
        label: 'Rubros'
    },
    {
        routeLink: 'offers',
        icon: 'fal fa-briefcase', // Ofertas de empleo
        label: 'Mis ofertas',
        items: [
            {
                routeLink: 'offers/insertupdateoffers',
                icon: 'fal fa-plus-square', // Agregar ofertas
                label: 'Agregar ofertas',
            },
            {
                routeLink: 'offers/listdeleteoffers',
                icon: 'fal fa-list-ul', // Todas mis ofertas
                label: 'Ofertas publicadas',
            },
        ]
    },
    {
        routeLink: 'typeWork',
        icon: 'fal fa-calendar-alt', // Tipos de trabajos laborales
        label: 'Jornada Laboral',
    },
    {
        routeLink: 'locationOffer',
        icon: 'fal fa-map-marker-alt', // Ubicación de oferta
        label: 'Ubicacion de oferta'
    },
    {
        routeLink: 'job-applications',
        icon: 'fal fa-file-alt',
        label: 'Ver solicitudes',
        items: [
            {
                routeLink: 'job-applications/listapplications',
                icon: 'fal fa-eye',
                label: 'Solicitudes recibidas',
            },
            {
                routeLink: 'job-applications/accepted-applications',
                icon: 'fal fa-check-circle',
                label: 'Solicitudes Aceptadas',
            }
        ]
    },
    {
        routeLink: 'responderpost',
        icon: 'fal fa-users', //Posts
        label: 'Preguntas',
    },
    {
        routeLink: 'general-reports',
        icon: 'fal fa-chart-bar',
        label: 'Reportes',
        items: [
            {
                routeLink: 'general-reports/reports',
                icon: 'fal fa-eye',
                label: 'Reporte N° 1',
            },
            {
                routeLink: 'general-reports/report-location',
                icon: 'fal fa-eye',
                label: 'Reporte N° 2',
            }
        ]
    },
    {
        routeLink: 'settings',
        icon: 'fas fa-cog',
        label: 'Mi Cuenta',
    },
];
