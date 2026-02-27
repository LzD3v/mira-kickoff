import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.API_BASE_URL;

  // Estrutura pronta: quando endpoints chegarem, usar aqui.
  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    const httpParams = new HttpParams({ fromObject: this.stringifyParams(params) });
    return this.http.get<T>(this.url(path), { params: httpParams });
  }

  post<T>(path: string, body: unknown, headers?: Record<string, string>) {
    const httpHeaders = new HttpHeaders(headers ?? {});
    return this.http.post<T>(this.url(path), body, { headers: httpHeaders });
  }

  put<T>(path: string, body: unknown) {
    return this.http.put<T>(this.url(path), body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.url(path));
  }

  private url(path: string) {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.base}${p}`;
  }

  private stringifyParams(params?: Record<string, string | number | boolean>) {
    if (!params) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) out[k] = String(v);
    return out;
  }
}