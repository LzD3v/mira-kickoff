import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { UiButtonComponent } from '@ui/button/ui-button.component';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'mira-app-shell',
  standalone: true,
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive, UiButtonComponent],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.is-collapsed]="collapsed()">
        <div class="sidebar__top">
          <a
            class="brand focus-ring"
            routerLink="/app/dashboard"
            aria-label="Ir para dashboard"
            (click)="closeSidebarOnMobile()"
          >
            <!-- ✅ Logo real na lateral -->
            <img class="brand__logo" src="/assets/brand/logo/mira-mark-gradient.svg" alt="" aria-hidden="true" />
            <span class="brand__name" *ngIf="!collapsed()">MIRA</span>
          </a>

          <!-- botão interno (desktop / quando menu aberto no mobile) -->
          <button
            class="icon-btn focus-ring sidebar__toggle"
            type="button"
            (click)="toggleSidebar()"
            aria-label="Alternar menu"
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

        <nav class="menu" aria-label="Navegação do app">
          <a
            class="menu__item focus-ring"
            routerLink="/app/dashboard"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">◆</span>
            <span class="menu__label" *ngIf="!collapsed()">Dashboard</span>
          </a>

          <a
            class="menu__item focus-ring"
            routerLink="/app/tasks"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">✓</span>
            <span class="menu__label" *ngIf="!collapsed()">Tarefas</span>
          </a>

          <a
            class="menu__item focus-ring"
            routerLink="/app/insights"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">↗</span>
            <span class="menu__label" *ngIf="!collapsed()">Insights</span>
          </a>

          <a
            class="menu__item focus-ring"
            routerLink="/app/settings"
            routerLinkActive="is-active"
            (click)="closeSidebarOnMobile()"
          >
            <span class="menu__icon" aria-hidden="true">⚙</span>
            <span class="menu__label" *ngIf="!collapsed()">Config</span>
          </a>
        </nav>

        <div class="sidebar__bottom" *ngIf="!collapsed()">
          <div class="mini">
            <div class="mini__title">Sessão</div>
            <div class="mini__value">{{ userLabel() }}</div>
          </div>
        </div>
      </aside>

      <div class="content">
        <header class="top">
          <div class="top__left">
            <!-- ✅ botão SEMPRE acessível no mobile -->
            <button
              *ngIf="isMobile()"
              class="icon-btn focus-ring top__menu"
              type="button"
              (click)="toggleSidebar()"
              aria-label="Abrir menu"
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

            <!-- ✅ tira redundância: em vez de “Visão geral / Kick-off...”
                 usamos algo útil e limpo -->
            <div class="crumbs">
              <div class="crumbs__title">Bem-vindo 👋</div>
              <div class="crumbs__sub muted">{{ userLabel() }}</div>
            </div>
          </div>

          <div class="top__right">
            <!-- ✅ sem botão da lua por enquanto -->
            <mira-ui-button variant="secondary" (click)="logout()">Sair</mira-ui-button>
          </div>
        </header>

        <main class="page">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Mobile overlay para fechar sidebar -->
    <button
      class="backdrop"
      type="button"
      [class.is-visible]="mobileOverlayVisible()"
      (click)="closeSidebarOnMobile()"
      aria-label="Fechar menu"
    ></button>
  `,
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly auth = inject(AuthService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly mq = window.matchMedia?.('(max-width: 980px)');
  readonly isMobile = signal(this.mq?.matches ?? true);

  // ✅ no mobile começa FECHADO (true = colapsado / escondido)
  readonly collapsed = signal(this.isMobile());

  readonly userLabel = computed(() => this.auth.session()?.user?.email ?? '—');

  readonly mobileOverlayVisible = computed(() => this.isMobile() && !this.collapsed());

  constructor() {
    // ✅ fundo do app: sólido + detalhe em CSS (sem imagem)
    document.body.classList.add('bg-app');
    document.body.classList.remove('bg-brand');

    this.destroyRef.onDestroy(() => {
      document.body.classList.remove('bg-app');
    });

    // reage à troca de breakpoint (desktop <-> mobile)
    const handler = (e: MediaQueryListEvent) => {
      this.isMobile.set(e.matches);
      if (e.matches) this.collapsed.set(true); // ao entrar no mobile, fecha o menu
    };

    this.mq?.addEventListener?.('change', handler);
    this.destroyRef.onDestroy(() => this.mq?.removeEventListener?.('change', handler));
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