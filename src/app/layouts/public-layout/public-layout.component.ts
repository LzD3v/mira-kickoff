import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { ThemeService } from '@core/services/theme.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type SectionKey = 'home' | 'como' | 'faq';
type LangCode = 'pt-BR' | 'pt-PT' | 'en' | 'es';

@Component({
  selector: 'mira-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, UiButtonComponent, NgIf, NgFor, TranslateModule],
  template: `
    <header class="topbar">
      <div class="container topbar__inner">
        <a
          class="brand focus-ring"
          routerLink="/"
          [attr.aria-label]="'PUBLIC.HEADER.ARIA_HOME' | translate"
        >
          <img class="brand__logo" src="/assets/brand/logo/logo-removebg.png" alt="MIRA" />
        </a>

        <nav class="nav" [attr.aria-label]="'PUBLIC.HEADER.ARIA_NAV' | translate">
          <a
            class="nav__link focus-ring"
            routerLink="/"
            (click)="onHomeClick($event)"
            [class.is-active]="activeSection() === 'home'"
            >{{ 'PUBLIC.HEADER.HOME' | translate }}</a
          >

          <a
            class="nav__link focus-ring"
            href="#como-funciona"
            (click)="scrollTo('como-funciona', $event)"
            [class.is-active]="activeSection() === 'como'"
            >{{ 'PUBLIC.HEADER.HOW' | translate }}</a
          >

          <a
            class="nav__link focus-ring"
            href="#faq"
            (click)="scrollTo('faq', $event)"
            [class.is-active]="activeSection() === 'faq'"
            >{{ 'PUBLIC.HEADER.FAQ' | translate }}</a
          >
        </nav>

        <div class="actions">
          <!-- 🌐 idioma -->
          <div class="langWrap" [class.is-open]="langOpen()">
            <button
              class="langBtn focus-ring"
              type="button"
              (click)="toggleLang($event)"
              [attr.aria-label]="'LANG.LABEL' | translate"
              [attr.title]="'LANG.LABEL' | translate"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" stroke-width="1.6"/>
                <path d="M2 12h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M12 2c3 3 3 17 0 20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M12 2c-3 3-3 17 0 20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".65"/>
              </svg>
              <span class="langBtn__code" aria-hidden="true">{{ langCode() }}</span>
              <span class="langBtn__chev" aria-hidden="true">▾</span>
            </button>

            <div class="langMenu" *ngIf="langOpen()" role="menu" [attr.aria-label]="'LANG.LABEL' | translate">
              <button
                class="langItem focus-ring"
                type="button"
                role="menuitem"
                (click)="setLang('pt-BR')"
                [class.is-active]="lang() === 'pt-BR'"
              >
                <span class="langItem__t">{{ 'LANG.PT_BR' | translate }}</span>
                <span class="langItem__k" aria-hidden="true">pt-BR</span>
              </button>

              <button
                class="langItem focus-ring"
                type="button"
                role="menuitem"
                (click)="setLang('pt-PT')"
                [class.is-active]="lang() === 'pt-PT'"
              >
                <span class="langItem__t">{{ 'LANG.PT_PT' | translate }}</span>
                <span class="langItem__k" aria-hidden="true">pt-PT</span>
              </button>

              <button
                class="langItem focus-ring"
                type="button"
                role="menuitem"
                (click)="setLang('en')"
                [class.is-active]="lang() === 'en'"
              >
                <span class="langItem__t">{{ 'LANG.EN' | translate }}</span>
                <span class="langItem__k" aria-hidden="true">EN</span>
              </button>

              <button
                class="langItem focus-ring"
                type="button"
                role="menuitem"
                (click)="setLang('es')"
                [class.is-active]="lang() === 'es'"
              >
                <span class="langItem__t">{{ 'LANG.ES' | translate }}</span>
                <span class="langItem__k" aria-hidden="true">ES</span>
              </button>
            </div>
          </div>

          <mira-ui-button routerLink="/login" variant="primary">
            {{ 'PUBLIC.HEADER.LOGIN' | translate }}
          </mira-ui-button>
        </div>
      </div>
    </header>

    <main class="main">
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container footer__inner">
        <div class="muted">{{ 'PUBLIC.FOOTER.COPY' | translate:{ year: year } }}</div>

        <div class="social" [attr.aria-label]="'PUBLIC.FOOTER.SOCIAL' | translate">
          <a
            class="social__btn focus-ring"
            href="https://instagram.com"
            target="_blank"
            rel="noopener"
            [attr.aria-label]="'PUBLIC.FOOTER.INSTAGRAM' | translate"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" stroke="currentColor" stroke-width="1.6"/>
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.6"/>
              <path d="M17.5 6.7h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </a>

          <a
            class="social__btn focus-ring"
            href="https://facebook.com"
            target="_blank"
            rel="noopener"
            [attr.aria-label]="'PUBLIC.FOOTER.FACEBOOK' | translate"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v3H7v3h3v6h3v-6h3l1-3h-4v-3c0-.6.4-1 1-1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>

        <div class="muted footer__copy">{{ 'PUBLIC.FOOTER.TAGLINE' | translate }}</div>
      </div>
    </footer>
  `,
  styleUrl: './public-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent implements AfterViewInit, OnDestroy {
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly year = new Date().getFullYear();
  readonly activeSection = signal<SectionKey>('home');

  private io?: IntersectionObserver;
  private onScrollRef = () => {
    if (window.scrollY < 140) this.activeSection.set('home');
  };

  // i18n menu
  private readonly LANG_KEY = 'mira_lang_v1';
  readonly langOpen = signal(false);
  readonly lang = signal<LangCode>('pt-BR');

  private onDocClick = (ev: MouseEvent) => {
    const t = ev.target as HTMLElement | null;
    if (!t) return;
    // fecha se clicou fora do wrapper do idioma
    if (!t.closest?.('.langWrap')) this.langOpen.set(false);
  };

  constructor() {
    // carrega idioma salvo (ou mantém o padrão)
    const saved = (localStorage.getItem(this.LANG_KEY) as LangCode | null) ?? null;
    const initial =
      saved ??
      ((this.translate.currentLang as LangCode) ||
        (this.translate.defaultLang as LangCode) ||
        'pt-BR');

    this.lang.set(initial);
    if (this.translate.currentLang !== initial) this.translate.use(initial);
  }

  langCode() {
    const l = this.lang();
    if (l === 'pt-BR') return 'PT';
    if (l === 'pt-PT') return 'PT';
    if (l === 'en') return 'EN';
    return 'ES';
  }

  toggleLang(ev: MouseEvent) {
    ev.stopPropagation();
    this.langOpen.update((v) => !v);
  }

  setLang(code: LangCode) {
    this.lang.set(code);
    try {
      localStorage.setItem(this.LANG_KEY, code);
    } catch {}
    this.translate.use(code);
    this.langOpen.set(false);
  }

  ngAfterViewInit(): void {
    document.body.classList.add('bg-brand');
    document.body.classList.remove('bg-app');

    if (this.router.url !== '/' && !this.router.url.startsWith('/#')) return;

    const how = document.getElementById('como-funciona');
    const faq = document.getElementById('faq');
    if (!how || !faq) return;

    this.io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (!best) return;

        const id = (best.target as HTMLElement).id;
        if (id === 'como-funciona') this.activeSection.set('como');
        if (id === 'faq') this.activeSection.set('faq');
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: [0.12, 0.22, 0.35],
      },
    );

    this.io.observe(how);
    this.io.observe(faq);

    window.addEventListener('scroll', this.onScrollRef, { passive: true });

    // fecha menu ao clicar fora
    document.addEventListener('click', this.onDocClick, { capture: true });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    window.removeEventListener('scroll', this.onScrollRef);
    document.body.classList.remove('bg-brand');
    document.removeEventListener('click', this.onDocClick, { capture: true } as any);
  }

  onHomeClick(ev: MouseEvent) {
    if (this.router.url === '/' || this.router.url.startsWith('/#')) {
      ev.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.activeSection.set('home');
    }
  }

  scrollTo(id: string, ev: MouseEvent) {
    ev.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}