import { Component, OnInit } from '@angular/core';
import { Empresa } from '../../models/empresa';
import { EmpresaService } from '../../services/empresa.service';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { RubroService } from '../../services/rubro.service';
import { Rubro } from '../../models/rubro';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-enterprice',
  templateUrl: './enterprice.component.html',
  styleUrls: ['./enterprice.component.scss']
})
export class EnterpriceComponent implements OnInit {
  empresas: any[] = [];
  searchTerm: string = '';
  usuarios: Usuario[] = [];
  rubros: Rubro[] = [];
  loading = false;

  constructor(
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService,
    private rubroService: RubroService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRubros();
  }

  cargarUsuarios(): void {
    this.usuarioService.listarTodos().subscribe({
      next: (u) => {
        this.usuarios = u;
        this.listarEmpresas();
      },
      error: () => this.snackBar.open('Error al cargar usuarios.', 'Cerrar', { duration: 3000 })
    });
  }

  cargarRubros(): void {
    this.rubroService.listarRubros().subscribe({
      next: (r) => {
        this.rubros = r;
        this.listarEmpresas();
      },
      error: () => this.snackBar.open('Error al cargar rubros.', 'Cerrar', { duration: 3000 })
    });
  }

  listarEmpresas(): void {
    this.loading = true;
    this.empresaService.listarEmpresas().subscribe({
      next: (data: Empresa[]) => {
        this.empresas = data.map(empresa => {
          const username = this.usuarios.find(u => u.id === empresa.usuarioId)?.username || 'Usuario no encontrado';
          const nombreRubro = this.rubros.find(r => r.id === empresa.rubroId)?.nombreRubro || 'Rubro no encontrado';
          return { ...empresa, username, nombreRubro };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al listar empresas:', err);
        this.snackBar.open('Error al listar empresas.', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  previewImage(logotipoBase64: string): string {
    const byteCharacters = atob(logotipoBase64);
    const byteNumbers = Array.from(byteCharacters).map(char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }

  buscarEmpresa(term: string): void {
    if (!term.trim()) {
      this.listarEmpresas();
      return;
    }

    this.loading = true;
    const isRuc = /^[0-9]+$/.test(term);

    const searchObservable = isRuc
      ? this.empresaService.buscarEmpresaPorRuc(term)
      : this.empresaService.buscarEmpresaPorNombre(term);

    searchObservable.subscribe({
      next: (empresas) => {
        this.empresas = empresas.map(empresa => {
          const username = this.usuarios.find(u => u.id === empresa.usuarioId)?.username || 'Usuario no encontrado';
          const nombreRubro = this.rubros.find(r => r.id === empresa.rubroId)?.nombreRubro || 'Rubro no encontrado';
          return { ...empresa, username, nombreRubro };
        });
        this.loading = false;

        if (this.empresas.length === 0) {
          this.snackBar.open(`No se ha encontrado empresas con ${isRuc ? 'RUC' : 'Nombre'}: ${term}`, 'Cerrar', { duration: 3000 });
        }
      },
      error: () => {
        this.snackBar.open('Error al buscar la empresa.', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.listarEmpresas();
  }
}
