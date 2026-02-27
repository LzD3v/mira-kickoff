import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    // mantém log (em produção você pluga Sentry/Datadog)
    // eslint-disable-next-line no-console
    console.error('[GlobalErrorHandler]', error);

    this.toast.push({
      type: 'danger',
      title: 'Erro na aplicação',
      message: 'Ocorreu um erro inesperado. Se persistir, contate o suporte.',
    });
  }
}