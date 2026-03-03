import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from '@core/http/auth.interceptor';
import { errorInterceptor } from '@core/http/error.interceptor';
import { GlobalErrorHandler } from '@core/errors/global-error-handler';

// ✅ ngx-translate (standalone/providers)
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

const LANG_KEY = 'mira_lang';
const SUPPORTED = new Set(['pt-BR', 'pt-PT', 'en', 'es']);

function initialLang(): 'pt-BR' | 'pt-PT' | 'en' | 'es' {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && SUPPORTED.has(saved)) return saved as any;

    const nav = (navigator.language || 'pt-BR').toLowerCase();
    if (nav.startsWith('pt-pt')) return 'pt-PT';
    if (nav.startsWith('pt')) return 'pt-BR';
    if (nav.startsWith('es')) return 'es';
    return 'en';
  } catch {
    return 'pt-BR';
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // ✅ i18n (carrega /assets/i18n/{lang}.json)
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
      lang: initialLang(),
      fallbackLang: 'pt-BR',
    }),
  ],
};