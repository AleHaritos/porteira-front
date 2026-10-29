import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilService } from '../util-service';
import { ProdutoEstoqueRequest, IProdutoEstoque, CompraEstoqueRequest, UsoEstoqueRequest, ICompraEstoque, IUsoEstoque } from '../../../shared/interfaces/IProdutoEstoque';


@Service()
export class EstoqueService {
  private http = inject(HttpClient);
  private util = inject(UtilService);

  private readonly API_URL = this.util.getUrlBase() + '/estoque';

  criarProduto(request: ProdutoEstoqueRequest): Observable<IProdutoEstoque> {
    return this.http.post<IProdutoEstoque>(`${this.API_URL}/produto`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  listarProdutos(fazendaId: number): Observable<IProdutoEstoque[]> {
    return this.http.get<IProdutoEstoque[]>(`${this.API_URL}/produto/fazenda/${fazendaId}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  excluirProduto(produtoId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/produto/${produtoId}`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  registrarCompra(produtoId: number, request: CompraEstoqueRequest): Observable<IProdutoEstoque> {
    return this.http.post<IProdutoEstoque>(`${this.API_URL}/produto/${produtoId}/compra`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  registrarUso(produtoId: number, request: UsoEstoqueRequest): Observable<IProdutoEstoque> {
    return this.http.post<IProdutoEstoque>(`${this.API_URL}/produto/${produtoId}/uso`, request).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  listarCompras(produtoId: number): Observable<ICompraEstoque[]> {
    return this.http.get<ICompraEstoque[]>(`${this.API_URL}/produto/${produtoId}/compras`).pipe(catchError((e) => this.util.errorHandler(e)));
  }

  listarUsos(produtoId: number): Observable<IUsoEstoque[]> {
    return this.http.get<IUsoEstoque[]>(`${this.API_URL}/produto/${produtoId}/usos`).pipe(catchError((e) => this.util.errorHandler(e)));
  }
}