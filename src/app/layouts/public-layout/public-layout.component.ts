import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { ThemeService } from '@core/services/theme.service';

type SectionKey = 'home' | 'como' | 'faq';

@Component({
  selector: 'mira-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, UiButtonComponent],
  template: `
    <header class="topbar">
      <div class="container topbar__inner">
        <a class="brand focus-ring" routerLink="/" aria-label="Ir para a página inicial do MIRA">
          <!-- ✅ Logo completa (ícone + texto) -->
          <img class="brand__logo" src="/assets/brand/logo/logo-removebg.png" alt="MIRA" />
        </a>

        <nav class="nav" aria-label="Navegação principal">
          <a
            class="nav__link focus-ring"
            routerLink="/"
            (click)="onHomeClick($event)"
            [class.is-active]="activeSection() === 'home'"
            >Home</a
          >

          <a
            class="nav__link focus-ring"
            href="#como-funciona"
            (click)="scrollTo('como-funciona', $event)"
            [class.is-active]="activeSection() === 'como'"
            >Como funciona</a
          >

          <a
            class="nav__link focus-ring"
            href="#faq"
            (click)="scrollTo('faq', $event)"
            [class.is-active]="activeSection() === 'faq'"
            >FAQ</a
          >
        </nav>

        <div class="actions">
          <!-- ✅ Tema oculto por enquanto (modo escuro fixo) -->
          <!--
          <button class="icon-btn focus-ring" type="button" (click)="theme.toggle()" aria-label="Alternar tema">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8Z" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </button>
          -->

          <mira-ui-button routerLink="/login" variant="primary">Entrar</mira-ui-button>
        </div>
      </div>
    </header>

    <main class="main">
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container footer__inner">
        <div class="muted">© {{ year }} MIRA</div>
        <div class="muted">Acessível • Responsivo • Feito para você</div>
      </div>
    </footer>
  `,
  styleUrl: './public-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent implements AfterViewInit, OnDestroy {
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly year = new Date().getFullYear();
  readonly activeSection = signal<SectionKey>('home');

  private io?: IntersectionObserver;
  private onScrollRef = () => {
    if (window.scrollY < 140) this.activeSection.set('home');
  };

  ngAfterViewInit(): void {
    // ✅ fundo com imagem SOMENTE no público (marketing/login)
    document.body.classList.add('bg-brand');
    document.body.classList.remove('bg-app');

    // só faz scroll-spy na Home
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
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    window.removeEventListener('scroll', this.onScrollRef);

    // ✅ limpeza (ao sair do layout público)
    document.body.classList.remove('bg-brand');
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