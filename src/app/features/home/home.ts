import { ChangeDetectionStrategy, Component, inject, OnInit, output, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { FazendaService } from '../../core/services/fazenda-service';
import { IFazenda } from '../../shared/intefaces/IFazenda';
import { FazendaTable } from '../fazenda-table/fazenda-table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHousePlus, lucideUserPlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { DialogNovaFazenda } from '../dialog-nova-fazenda/dialog-nova-fazenda';
import { AuthService, UsuarioLogado } from '../../core/auth/AuthService';
import { CommonModule } from '@angular/common';
import { AdministracaoTable } from '../administracao-table/administracao-table';
import { Usuario } from '../../shared/intefaces/IUsuario';
import { DialogNovoUsuario } from '../dialog-novo-usuario/dialog-novo-usuario';
import { Router } from '@angular/router';

@Component({
  imports: [HlmTabsImports, HlmCardImports, HlmButtonImports, FazendaTable, AdministracaoTable, NgIcon, CommonModule],
  providers: [provideIcons({ lucideHousePlus, lucideUserPlus })],
  selector: 'app-home',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private fazendaService = inject(FazendaService);
  private authService = inject(AuthService);
  private readonly _hlmDialogService = inject(HlmDialogService);
  private router = inject(Router);
  usuario = signal<UsuarioLogado | null>(this.authService.usuario());

  carregarUsuarios = signal(0);


  fazendas = signal<IFazenda[]>([]);
  usuariosCadastrados = signal<Usuario[]>([]);
  usuariosCarregados = signal(false);
  paginaAtual = signal(0);
  totalPaginas = signal(0);
  abaAtiva = signal('home');

  ngOnInit(): void {
    this.carregar();
  }

  carregar() {
    this.fazendaService.listarFazendas(this.paginaAtual()).subscribe((res) => {
      this.fazendas.set(res.content);
      this.totalPaginas.set(res.totalPages);
    });
  }

  onMudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  onEditar(fazenda: IFazenda) {

  }

  onExcluir(fazenda: IFazenda) {

  }

  onVerDetalhes(fazenda: IFazenda) {
    this.router.navigate(['/fazenda', fazenda.id]);
  }

  adicionarFazenda() {
    const dialogRef = this._hlmDialogService.open(DialogNovaFazenda, {
      context: {
        fazenda: {},
      },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[700px]',
    });

    dialogRef.closed$.subscribe((fazenda) => {
      if (fazenda) {
        this.carregar()
      }
    });
  }

  adicionarUsuario() {
    const dialogRef = this._hlmDialogService.open(DialogNovoUsuario, {
      context: {
        usuario: {},
      },
      contentClass: 'sm:!max-w-[950px], sm:!min-w-[700px]',
    });

    dialogRef.closed$.subscribe((usuario) => {
      if (usuario) {
        console.log(usuario)
        this.carregarUsuarios.update(value => value + 1);
      }
    });
  }

  onAbaChange(aba: string) {
    this.abaAtiva.set(aba);
  }

}
