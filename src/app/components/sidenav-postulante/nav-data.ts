import { INavbarData } from "./helper";

export const navbarData: INavbarData[] = [
    {
        routeLink: 'dashboard',
        icon: 'fal fa-home', // Icono para Dashboard
        label: 'Dashboard',
    },
    {
        routeLink: 'documents',
        icon: 'fal fa-file-alt', // Icono para Documentos
        label: 'Mis documentos',
        items: [
            {
                routeLink: 'documents/insertupdatedocuments',
                icon: 'fas fa-plus-circle', // Icono para agregar/actualizar documentos
                label: 'Nuevo documento',
            },
            {
                routeLink: 'documents/listdeletedocuments',
                icon: 'fas fa-trash-alt', // Icono para listar ofertas eliminadas
                label: 'Historial',
            }
        ]
    },
    {
        routeLink: 'offers',
        icon: 'fas fa-briefcase', // Icono para Ofertas
        label: 'Ver Ofertas',
        items: [
            {
                routeLink: 'offers/listofferspostulante',
                icon: 'fas fa-list-alt', // Icono para listar ofertas
                label: 'Ofertas disponibles',
            },
        ]
    },
    {
        routeLink: 'favorites',
        icon: 'fas fa-heart', // Icono para Favoritos
        label: 'Ofertas favoritas',
    },
    
    {
        routeLink: 'enterprice',
        icon: 'fas fa-building', // Icono para Base de datos de compañías
        label: 'BD Empresas',
    },
    {
        routeLink: 'job-applications',
        icon: 'fal fa-file-alt',
        label: 'Mis solicitudes',
        items: [
            {
                routeLink: 'job-applications/listallapplications',
                icon: 'fal fa-check-circle',
                label: 'Historial',
            }
        ]
    },
    {
        routeLink: 'settings',
        icon: 'fas fa-cog', // Icono para Configuración de cuenta
        label: 'Mi Cuenta',
    },
];
