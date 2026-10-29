import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./core/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'fazenda/:id',
        loadComponent: () =>
          import('./features/fazenda/fazenda-home/fazenda-home').then((m) => m.FazendaHome),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'financeiro' },
          {
            path: 'negocios',
            loadComponent: () =>
              import('./features/negocios/negocios').then((m) => m.Negocios),
          },
          {
            path: 'negocios/:negocioId',
            loadComponent: () =>
              import('./features/negocios/negocio-detalhe/negocio-detalhe').then((m) => m.NegocioDetalhe),
          },
          {
            path: 'financeiro',
            loadComponent: () =>
              import('./features/financeiro/financeiro').then((m) => m.Financeiro),
          },
          {
            path: 'veiculo',
            loadComponent: () =>
              import('./features/veiculo/veiculo').then((m) => m.Veiculo),
          },
          {
            path: 'abastecimento',
            loadComponent: () =>
              import('./features/abastecimento/abastecimento').then((m) => m.Abastecimento),
          },
          {
            path: 'equipamento',
            loadComponent: () =>
              import('./features/equipamento/equipamento').then((m) => m.Equipamento),
          },
          {
            path: 'fornecedores',
            loadComponent: () =>
              import('./features/equipamento/fornecedores/fornecedores').then((m) => m.Fornecedores),
          },
          {
            path: 'fornecedores/:fornecedorId',
            loadComponent: () =>
              import('./features/equipamento/fornecedor-detalhe/fornecedor-detalhe').then((m) => m.FornecedorDetalhe),
          },
          {
            path: 'animais',
            loadComponent: () =>
              import('./features/animais/animais').then((m) => m.Animais),
          },
          {
            path: 'animais/piquete/:piqueteId',
            loadComponent: () =>
              import('./features/animais/piquete-detalhes/piquete-detalhes').then((m) => m.PiqueteDetalhes),
          },
          {
            path: 'manutencao',
            loadComponent: () =>
              import('./features/equipamento/manutencao/manutencao').then((m) => m.Manutencao),
          },
          {
            path: 'posto',
            loadComponent: () =>
              import('./features/postos-estoque/postos-estoque').then((m) => m.PostosEstoque),
          },
          {
            path: 'posto/:postoId',
            loadComponent: () =>
              import('./features/postos-estoque/posto-detalhe/posto-detalhe').then((m) => m.PostoDetalhe),
          },
          {
            path: 'contas-pendentes',
            loadComponent: () =>
              import('./features/financeiro/contas-pendentes/contas-pendentes').then((m) => m.ContasPendentes),
          },
          {
            path: 'projetos',
            loadComponent: () =>
              import('./features/projeto/projeto').then((m) => m.Projeto),
          },
          {
            path: 'projetos/:projetoId',
            loadComponent: () =>
              import('./features/projeto/projeto-detalhe/projeto-detalhe').then((m) => m.ProjetoDetalhe),
          },
          {
            path: 'safra',
            loadComponent: () =>
              import('./features/safra/safra').then((m) => m.Safra),
          },
          {
            path: 'safra/:safraId',
            loadComponent: () =>
              import('./features/safra/safra-detalhes/safra-detalhes').then((m) => m.SafraDetalhes),
          },
          {
            path: 'safra/:safraId/talhao/:talhaoId',
            loadComponent: () =>
              import('./features/safra/talhao-detalhes/talhao-detalhes').then((m) => m.TalhaoDetalhes),
          },
          {
            path: 'calendario',
            loadComponent: () =>
              import('./features/calendario/calendario').then((m) => m.Calendario),
          },
          {
            path: 'tarefas',
            loadComponent: () =>
              import('./features/tarefa/tarefa').then((m) => m.Tarefa),
          },
        ],
      },
    ]
  }
];
