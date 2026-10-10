import { Service } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilService } from './util-service';
import { ContaPendenteRequest, IContaPendente, IParcelaContaPendente, StatusParcela } from '../../shared/interfaces/IContaPendente';
import { TipoTransacao } from '../../shared/interfaces/ITransacao';
import { PageResponse } from '../../shared/interfaces/IPage';

@Service()
export class ContasPendentesService {
    private http = inject(HttpClient);
    private utilService = inject(UtilService);

    salvar(request: ContaPendenteRequest): Observable<IContaPendente> {
        return this.http
            .post<IContaPendente>(`${this.utilService.getUrlBase()}/conta-pendente`, request)
            .pipe(catchError(this.utilService.errorHandler));
    }

    buscarParcelasPorFazenda(
        fazendaId: number,
        pagina: number,
        tamanho: number,
        status?: StatusParcela | null,
        tipo?: TipoTransacao | null,
    ): Observable<PageResponse<IParcelaContaPendente>> {
        let params = `page=${pagina}&size=${tamanho}`;
        if (status) params += `&status=${status}`;
        if (tipo) params += `&tipo=${tipo}`;

        return this.http
            .get<PageResponse<IParcelaContaPendente>>(`${this.utilService.getUrlBase()}/conta-pendente/fazenda/${fazendaId}/parcelas?${params}`)
            .pipe(catchError(this.utilService.errorHandler));
    }

    darBaixa(parcelaId: number, dataBaixa?: string | null): Observable<IParcelaContaPendente> {
        const params = dataBaixa ? `?dataBaixa=${dataBaixa}` : '';

        return this.http
            .patch<IParcelaContaPendente>(`${this.utilService.getUrlBase()}/conta-pendente/parcela/${parcelaId}/baixa${params}`, {})
            .pipe(catchError(this.utilService.errorHandler));
    }
}