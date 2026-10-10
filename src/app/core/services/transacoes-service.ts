import { Service } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilService } from './util-service';
import { ITransacao, ResumoFinanceiro, TransacaoRequest, TransacaoUpdateRequest } from '../../shared/interfaces/ITransacao';
import { PageResponse } from '../../shared/interfaces/IPage';

@Service()
export class TransacoesService {
    private http = inject(HttpClient);
    private utilService = inject(UtilService);

    salvar(request: TransacaoRequest): Observable<ITransacao> {
        return this.http
            .post<ITransacao>(`${this.utilService.getUrlBase()}/transacao`, request)
            .pipe(catchError(this.utilService.errorHandler));
    }

    buscarPorFazenda(
        fazendaId: number,
        pagina: number,
        tamanho: number,
        dataInicio?: string | null,
        dataFim?: string | null,
        tipo?: 'RECEITA' | 'GASTO' | null,
    ): Observable<PageResponse<ITransacao>> {
        let params = `page=${pagina}&size=${tamanho}`;
        if (dataInicio) params += `&dataInicio=${dataInicio}`;
        if (dataFim) params += `&dataFim=${dataFim}`;
        if (tipo) params += `&tipo=${tipo}`;

        return this.http
            .get<PageResponse<ITransacao>>(`${this.utilService.getUrlBase()}/transacao/fazenda/${fazendaId}?${params}`)
            .pipe(catchError(this.utilService.errorHandler));
    }


    buscarResumoPorNegocio(negocioId: number, dataInicio?: string | null, dataFim?: string | null): Observable<ResumoFinanceiro> {
        let params = new HttpParams();
        if (dataInicio) params = params.set('dataInicio', dataInicio);
        if (dataFim) params = params.set('dataFim', dataFim);

        return this.http.get<ResumoFinanceiro>(`${this.utilService.getUrlBase()}/transacao/negocio/${negocioId}/resumo`, { params });
    }

    atualizar(id: number, request: TransacaoUpdateRequest): Observable<ITransacao> {
        return this.http
            .put<ITransacao>(`${this.utilService.getUrlBase()}/transacao/${id}`, request)
            .pipe(catchError(this.utilService.errorHandler));
    }

    desativar(id: number): Observable<void> {
        return this.http
            .patch<void>(`${this.utilService.getUrlBase()}/transacao/${id}/desativar`, {})
            .pipe(catchError(this.utilService.errorHandler));
    }

    reativar(id: number): Observable<void> {
        return this.http
            .patch<void>(`${this.utilService.getUrlBase()}/transacao/${id}/reativar`, {})
            .pipe(catchError(this.utilService.errorHandler));
    }

    buscarResumo(fazendaId: number, dataInicio?: string | null, dataFim?: string | null): Observable<ResumoFinanceiro> {
        let params = '';
        if (dataInicio) params += `dataInicio=${dataInicio}`;
        if (dataFim) params += `${params ? '&' : ''}dataFim=${dataFim}`;

        return this.http
            .get<ResumoFinanceiro>(`${this.utilService.getUrlBase()}/transacao/fazenda/${fazendaId}/resumo${params ? '?' + params : ''}`)
            .pipe(catchError(this.utilService.errorHandler));
    }
}