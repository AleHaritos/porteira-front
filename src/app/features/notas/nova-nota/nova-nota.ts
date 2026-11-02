import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideStickyNote } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NegocioService } from '../../../core/services/negocio-service';
import { NotaService } from '../../../core/services/notas/nota-service';
import { ProjetoService } from '../../../core/services/projeto/projeto-service';
import { SafraService } from '../../../core/services/safra/safra-service';
import { ToastService } from '../../../core/services/toast-service';
import { INegocio } from '../../../shared/interfaces/INegocio';
import { INota, INotaRequest } from '../../../shared/interfaces/INota';
import { IProjeto } from '../../../shared/interfaces/IProjeto';
import { ISafra } from '../../../shared/interfaces/ISafras';

interface NovaNotaContext {
  fazendaId: number;
  nota?: INota;
}

type Vinculo = 'NENHUM' | 'NEGOCIO' | 'SAFRA' | 'PROJETO';

@Component({
  selector: 'app-nova-nota',
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideStickyNote })],
  styleUrl: './nova-nota.css',
  templateUrl: './nova-nota.html',
})
export class NovaNota implements OnInit {
  private dialogRef = inject(BrnDialogRef);
  context = injectBrnDialogContext<NovaNotaContext>();
  private fb = inject(FormBuilder);
  private notaService = inject(NotaService);
  private toastService = inject(ToastService);
  private negocioService = inject(NegocioService);
  private safraService = inject(SafraService);
  private projetoService = inject(ProjetoService);

  salvando = signal(false);
  editando = signal(!!this.context.nota);

  vinculo = signal<Vinculo>('NENHUM');
  negocios = signal<INegocio[]>([]);
  safras = signal<ISafra[]>([]);
  projetos = signal<IProjeto[]>([]);
  negocioSelecionado = signal<number | null>(null);
  safraSelecionada = signal<number | null>(null);
  projetoSelecionado = signal<number | null>(null);

  itemToStringNegocio = (value: number | null | undefined) =>
    this.negocios().find((n) => n.id === value)?.nome || '';

  itemToStringSafra = (value: number | null | undefined) =>
    this.safras().find((s) => s.id === value)?.nome || '';

  itemToStringProjeto = (value: number | null | undefined) =>
    this.projetos().find((p) => p.id === value)?.nome || '';

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    corpo: [''],
  });

  ngOnInit(): void {
    const fazendaId = this.context.fazendaId;

    this.negocioService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (negocios) => this.negocios.set(negocios),
    });

    this.safraService.buscarSafrasPorFazenda(fazendaId).subscribe({
      next: (safras) => this.safras.set(safras.content),
    });

    this.projetoService.listarTodosPorFazenda(fazendaId).subscribe({
      next: (projetos) => this.projetos.set(projetos),
    });

    const nota = this.context.nota;
    if (nota) {
      this.form.patchValue({
        titulo: nota.titulo,
        corpo: nota.corpo || '',
      });

      if (nota.negocioId) {
        this.vinculo.set('NEGOCIO');
        this.negocioSelecionado.set(nota.negocioId);
      } else if (nota.safraId) {
        this.vinculo.set('SAFRA');
        this.safraSelecionada.set(nota.safraId);
      } else if (nota.projetoId) {
        this.vinculo.set('PROJETO');
        this.projetoSelecionado.set(nota.projetoId);
      }
    }
  }

  onVinculoChange(vinculo: Vinculo): void {
    this.vinculo.set(vinculo);
    this.negocioSelecionado.set(null);
    this.safraSelecionada.set(null);
    this.projetoSelecionado.set(null);
  }

  onNegocioChange(id: number | null | undefined): void {
    this.negocioSelecionado.set(id ?? null);
  }

  onSafraChange(id: number | null | undefined): void {
    this.safraSelecionada.set(id ?? null);
  }

  onProjetoChange(id: number | null | undefined): void {
    this.projetoSelecionado.set(id ?? null);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  salvar(): void {
    const { titulo, corpo } = this.form.value;

    if (this.form.invalid || !titulo?.trim()) {
      this.form.markAllAsTouched();
      this.toastService.showError('Erro', 'Informe o título da nota');
      return;
    }

    const vinculo = this.vinculo();
    const negocioId = vinculo === 'NEGOCIO' ? this.negocioSelecionado() : null;
    const safraId = vinculo === 'SAFRA' ? this.safraSelecionada() : null;
    const projetoId = vinculo === 'PROJETO' ? this.projetoSelecionado() : null;

    if (vinculo !== 'NENHUM' && negocioId == null && safraId == null && projetoId == null) {
      this.toastService.showError('Erro', 'Selecione o item do vínculo ou escolha "Nenhum"');
      return;
    }

    const request: INotaRequest = {
      fazendaId: this.context.fazendaId,
      titulo: titulo.trim(),
      corpo: corpo?.trim() ? corpo : null,
      negocioId,
      safraId,
      projetoId,
    };

    const nota = this.context.nota;
    const chamada = nota ? this.notaService.atualizar(nota.id, request) : this.notaService.salvar(request);

    this.salvando.set(true);
    chamada.subscribe({
      next: () => {
        this.toastService.showSuccess('Sucesso', nota ? 'Nota atualizada!' : 'Nota criada!');
        this.salvando.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.showError('Erro', 'Não foi possível salvar a nota');
      },
    });
  }
}