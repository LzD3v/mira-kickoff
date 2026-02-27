import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@core/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const msg =
          (err.error as any)?.message ||
          err.message ||
          `Erro HTTP ${err.status} — tente novamente.`;

        toast.push({
          type: 'danger',
          title: 'Falha na comunicação',
          message: msg,
        });
      } else {
        toast.push({
          type: 'danger',
          title: 'Erro inesperado',
          message: 'Algo deu errado. Tente novamente.',
        });
      }
      return throwError(() => err);
    }),
  );
};