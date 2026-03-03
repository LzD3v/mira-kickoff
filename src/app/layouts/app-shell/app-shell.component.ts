import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { UiButtonComponent } from '@ui/button/ui-button.component';
import { AuthService } from '@core/services/auth.service';

type LangCode = 'pt-BR' | 'pt-PT' | 'en' | 'es';

@Component({
  selector: 'mira-app-shell',
  standalone: true,
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive, UiButtonComponent, TranslateModule],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.is-collapsed]="collapsed()">
        <div class="sidebar__top">
          <a
            class="brand focus-ring"
            routerLink="/app/dashboard"
            [attr.aria-label]="'APP_SHELL.ARIA.GO_DASHBOARD' | translate"
            (click)="closeSidebarOnMobile()"
          >
            <img class="brand__logo" src="/assets/brand/logo/mira-mark-gradient.svg" alt="" aria-hidden="true" />
            <span class="brand__name" *ngIf="!collapsed()">MIRA</span>
          </a>

          <button
            class="icon-btn focus-ring sidebar__toggle"
            type="button"
            (click)="toggleSidebar()"
            [attr.aria-label]="'APP_SHELL.ARIA.TOGGLE_MENU' | translate"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <nav class="menu" [attr.aria-label]="'APP_SHELL.ARIA.APP_NAV' | translate">
          <a
            class="menu__item focus-ring"
            routerLink="/app/dashboard"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">◆</span>
            <span class="menu__label" *ngIf="!collapsed()">{{ 'NAV.DASHBOARD' | translate }}</span>
          </a>

          <a
            class="menu__item focus-ring"
            routerLink="/app/tasks"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">✓</span>
            <span class="menu__label" *ngIf="!collapsed()">{{ 'NAV.TASKS' | translate }}</span>
          </a>

          <a
            class="menu__item focus-ring"
            routerLink="/app/chat"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 8h10a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H13l-3 2v-2H7a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="menu__label" *ngIf="!collapsed()">{{ 'NAV.CHAT' | translate }}</span>
          </a>

          <a
            class="menu__item focus-ring"
            routerLink="/app/insights"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">↗</span>
            <span class="menu__label" *ngIf="!collapsed()">{{ 'NAV.INSIGHTS' | translate }}</span>
          </a>

          <a
            class="menu__item focus-ring"
            routerLink="/app/settings"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">⚙</span>
            <span class="menu__label" *ngIf="!collapsed()">{{ 'NAV.SETTINGS' | translate }}</span>
          </a>
        </nav>

        <div class="sidebar__bottom" *ngIf="!collapsed()">
          <div class="mini">
            <div class="mini__title">{{ 'APP.SESSION' | translate }}</div>
            <div class="mini__value">{{ userLabel() }}</div>
          </div>
        </div>
      </aside>

      <div class="content">
        <header class="top">
          <div class="top__left">
            <button
              *ngIf="isMobile()"
              class="icon-btn focus-ring top__menu"
              type="button"
              (click)="toggleSidebar()"
              [attr.aria-label]="'APP_SHELL.ARIA.OPEN_MENU' | translate"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <div class="crumbs">
              <div class="crumbs__title">{{ 'APP.WELCOME' | translate }}</div>
              <div class="crumbs__sub muted">{{ userLabel() }}</div>
            </div>
          </div>

          <div class="top__right">
            <!-- 🌐 idioma (igual ao public-layout) -->
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

            <mira-ui-button variant="secondary" (click)="logout()">
              {{ 'APP.LOGOUT' | translate }}
            </mira-ui-button>
          </div>
        </header>

        <main class="page" [class.page--fullbleed]="isChat()">
          <router-outlet />
        </main>
      </div>
    </div>

    <button
      class="backdrop"
      type="button"
      [class.is-visible]="mobileOverlayVisible()"
      (click)="closeSidebarOnMobile()"
      [attr.aria-label]="'APP_SHELL.ARIA.CLOSE_MENU' | translate"
    ></button>
  `,
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  private readonly mq = window.matchMedia?.('(max-width: 980px)');
  readonly isMobile = signal(this.mq?.matches ?? true);

  readonly collapsed = signal(this.isMobile());

  readonly userLabel = computed(() => this.auth.session()?.user?.email ?? '—');
  readonly mobileOverlayVisible = computed(() => this.isMobile() && !this.collapsed());

  readonly isChat = signal(false);

  // i18n menu (mesma chave do public layout)
  private readonly LANG_KEY = 'mira_lang_v1';
  readonly langOpen = signal(false);
  readonly lang = signal<LangCode>('pt-BR');

  private onDocClick = (ev: MouseEvent) => {
    const t = ev.target as HTMLElement | null;
    if (!t) return;
    if (!t.closest?.('.langWrap')) this.langOpen.set(false);
  };

  constructor() {
    document.body.classList.add('bg-app');
    document.body.classList.remove('bg-brand');

    this.destroyRef.onDestroy(() => {
      document.body.classList.remove('bg-app');
    });

    // idioma inicial (puxa do localStorage)
    const saved = (localStorage.getItem(this.LANG_KEY) as LangCode | null) ?? null;
    const initial =
      saved ??
      ((this.translate.currentLang as LangCode) ||
        (this.translate.defaultLang as LangCode) ||
        'pt-BR');

    this.lang.set(initial);
    if (this.translate.currentLang !== initial) this.translate.use(initial);

    // fecha menu ao clicar fora
    document.addEventListener('click', this.onDocClick, { capture: true });
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('click', this.onDocClick, { capture: true } as any);
    });

    const handler = (e: MediaQueryListEvent) => {
      this.isMobile.set(e.matches);
      if (e.matches) this.collapsed.set(true);
    };

    this.mq?.addEventListener?.('change', handler);
    this.destroyRef.onDestroy(() => this.mq?.removeEventListener?.('change', handler));

    const setFlag = (url: string) => this.isChat.set(url.startsWith('/app/chat'));
    setFlag(this.router.url);

    const sub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) setFlag(e.urlAfterRedirects);
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
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
    try { localStorage.setItem(this.LANG_KEY, code); } catch {}
    this.translate.use(code);
    this.langOpen.set(false);
  }

  toggleSidebar() {
    this.collapsed.update((v) => !v);
  }

  closeSidebarOnMobile() {
    if (this.isMobile()) this.collapsed.set(true);
  }

  logout() {
    this.auth.logout();
  }
}