import { Injectable, signal } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'mira_theme';
  readonly theme = signal<Theme>('dark');

  constructor() {
    const saved = (localStorage.getItem(this.KEY) as Theme | null) ?? null;
    const sysPrefersLight =
      window.matchMedia?.('(prefers-color-scheme: light)')?.matches ?? false;

    const t: Theme = saved ?? (sysPrefersLight ? 'light' : 'dark');
    this.apply(t);
  }

  toggle() {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

    private animTimer?: number;

    apply(theme: Theme) {
    this.theme.set(theme);

    // animação suave ao trocar tema
    document.documentElement.classList.add('theme-animating');
    window.clearTimeout(this.animTimer);

    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(this.KEY, theme);

    this.animTimer = window.setTimeout(() => {
        document.documentElement.classList.remove('theme-animating');
    }, 260);
    }
}