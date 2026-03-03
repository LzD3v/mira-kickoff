import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type LangCode = 'pt-BR' | 'pt-PT' | 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly t = inject(TranslateService);

  private readonly KEY = 'mira_lang_v1';
  readonly supported: { code: LangCode; labelKey: string }[] = [
    { code: 'pt-BR', labelKey: 'LANG.PT_BR' },
    { code: 'pt-PT', labelKey: 'LANG.PT_PT' },
    { code: 'en', labelKey: 'LANG.EN' },
    { code: 'es', labelKey: 'LANG.ES' },
  ];

  init() {
    this.t.addLangs(this.supported.map((s) => s.code));
    this.t.setDefaultLang('pt-BR');

    const saved = this.getSaved();
    const browser = this.pickFromNavigator();

    this.use(saved ?? browser ?? 'pt-BR');
  }

  get current(): LangCode {
    return (this.t.currentLang as LangCode) || 'pt-BR';
  }

  use(code: LangCode) {
    this.t.use(code);
    try { localStorage.setItem(this.KEY, code); } catch {}
    document.documentElement.setAttribute('lang', code);
  }

  private getSaved(): LangCode | null {
    try {
      const v = localStorage.getItem(this.KEY) as LangCode | null;
      return v && this.supported.some((s) => s.code === v) ? v : null;
    } catch {
      return null;
    }
  }

  private pickFromNavigator(): LangCode | null {
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('pt-pt')) return 'pt-PT';
    if (nav.startsWith('pt')) return 'pt-BR';
    if (nav.startsWith('es')) return 'es';
    if (nav.startsWith('en')) return 'en';
    return null;
  }
}