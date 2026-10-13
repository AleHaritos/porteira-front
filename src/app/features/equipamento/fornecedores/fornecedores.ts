import { Component, inject, OnInit, signal } from '@angular/core';
import { IFornecedor } from '../../../shared/interfaces/IFornecedor';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { FornecedorService } from '../../../core/services/equipamento/fornecedor-service';
import { ToastService } from '../../../core/services/toast-service';
import { NovoFornecedor } from '../novo-fornecedor/novo-fornecedor';
import { PagarFornecedor } from '../pagar-fornecedor/pagar-fornecedor';

@Component({
  selector: 'app-fornecedores',
  imports: [CommonModule, HlmTableImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucidePlus })],
  styleUrl: './fornecedores.css',
  templateUrl: './fornecedores.html',
})
export class Fornecedores implements OnInit {
  private route = inject(ActivatedRoute);
  private fornecedorService = inject(FornecedorService);
  private dialogService = inject(HlmDialogService);
  private toastService = inject(ToastService);

  fazendaId = signal<number | null>(null);
  fornecedores = signal<IFornecedor[]>([]);
  carregando = signal(false);

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.fazendaId.set(id ? Number(id) : null);
      this.carregar();
    });
  }

  carregar(): void {
    const fazendaId = this.fazendaId();
    if (fazendaId == null) return;

    this.carregando.set(true);
    this.fornecedorService.listarPorFazenda(fazendaId).subscribe({
      next: (res) => {
        this.fornecedores.set(res);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.toastService.showError('Erro', 'Não foi possível carregar os fornecedores');
      },
    });
  }

  abrirNovoFornecedor(): void {
    const dialogRef = this.dialogService.open(NovoFornecedor, {
      context: { fazendaId: this.fazendaId() },
      contentClass: 'sm:!max-w-[750px], sm:!min-w-[500px]',
    });
    dialogRef.closed$.subscribe((sucesso) => {
      if (sucesso) {
        this.toastService.showSuccess('Sucesso', 'Fornecedor cadastrado com sucesso');
        this.carregar();
      }
    });
  }

  abrirPagarFornecedor(fornecedor: IFornecedor): void {
    const dialogRef = this.dialogService.open(PagarFornecedor, {
      context: { fazendaId: this.fazendaId(), fornecedor },
      contentClass: 'sm:!max-w-[750px], sm:!min-w-[500px]',
    });
    dialogRef.closed$.subscribe((sucesso) => {
      if (sucesso) {
        this.toastService.showSuccess('Sucesso', 'Pagamento registrado com sucesso');
        this.carregar();
      }
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
