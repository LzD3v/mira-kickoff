import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { UiCardComponent } from '@ui/card/ui-card.component';
import { RevealOnScrollDirective } from '@core/directives/reveal-on-scroll.directive';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type Testimonial = {
  name: string;
  role: string;
  city: string;
  quote: string;
  rating: 5;
  verified: boolean;
};

type PlanKey = 'free' | 'pro' | 'elite';

type PlanModalData = {
  eyebrow: string;
  title: string;
  desc: string;
  price: string;
  fine: string;
  cta: string;
  ctaLink: string;
  items: string[];
};

@Component({
  standalone: true,
  imports: [
    RouterLink,
    UiButtonComponent,
    UiCardComponent,
    RevealOnScrollDirective,
    NgFor,
    NgIf,
    TranslateModule,
  ],
  animations: [
    trigger('slideSwap', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateX(26px)' }),
        animate(
          '420ms cubic-bezier(.2,.9,.2,1)',
          style({ opacity: 1, transform: 'translateX(0)' }),
        ),
      ]),
    ]),
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '420ms cubic-bezier(.2,.9,.2,1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
    trigger('fadeUpDelay', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate(
          '520ms 120ms cubic-bezier(.2,.9,.2,1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__copy" @fadeUp>
          <div class="pill">
            <span class="dot"></span>
            <span>{{ 'MARKETING.HERO.PILL' | translate }}</span>
          </div>

          <h1 class="h1">
            {{ 'MARKETING.HERO.TITLE.A' | translate }}
            <span class="grad">{{ 'MARKETING.HERO.TITLE.B' | translate }}</span>{{ 'MARKETING.HERO.TITLE.C' | translate }}
          </h1>

          <p class="sub muted">
            {{ 'MARKETING.HERO.SUB.A' | translate }}<b>{{ 'MARKETING.HERO.SUB.B' | translate }}</b>{{ 'MARKETING.HERO.SUB.C' | translate }}
          </p>

          <div class="trust">
            <div class="trust__item">
              <span class="trust__k">{{ 'MARKETING.HERO.TRUST.T1.K' | translate }}</span>
              <span class="trust__v">{{ 'MARKETING.HERO.TRUST.T1.V' | translate }}</span>
            </div>
            <div class="trust__item">
              <span class="trust__k">{{ 'MARKETING.HERO.TRUST.T2.K' | translate }}</span>
              <span class="trust__v">{{ 'MARKETING.HERO.TRUST.T2.V' | translate }}</span>
            </div>
            <div class="trust__item">
              <span class="trust__k">{{ 'MARKETING.HERO.TRUST.T3.K' | translate }}</span>
              <span class="trust__v">{{ 'MARKETING.HERO.TRUST.T3.V' | translate }}</span>
            </div>
          </div>

          <div class="hero__cta">
            <button
              class="cta-primary focus-ring"
              type="button"
              (click)="scrollToPricing()"
              [attr.aria-label]="'MARKETING.HERO.CTA.ARIA_PRIMARY' | translate"
            >
              <span class="cta-primary__shine" aria-hidden="true"></span>
              <span class="cta-primary__text">{{ 'MARKETING.HERO.CTA.PRIMARY' | translate }}</span>
              <span class="cta-primary__arrow" aria-hidden="true">→</span>
            </button>

            <a class="cta-secondary focus-ring" href="#como-funciona">{{ 'MARKETING.HERO.CTA.SECONDARY' | translate }}</a>
          </div>

          <div class="bullets">
            <div class="b"><span class="b__ic" aria-hidden="true">✓</span> {{ 'MARKETING.HERO.BULLETS.B1' | translate }}</div>
            <div class="b"><span class="b__ic" aria-hidden="true">↗</span> {{ 'MARKETING.HERO.BULLETS.B2' | translate }}</div>
            <div class="b"><span class="b__ic" aria-hidden="true">◆</span> {{ 'MARKETING.HERO.BULLETS.B3' | translate }}</div>
          </div>
        </div>

        <div class="hero__visual" aria-hidden="true" @fadeUpDelay>
          <div class="mock">
            <div class="mock__top">
              <div class="dots">
                <span></span><span></span><span></span>
              </div>
              <div class="mock__title">{{ 'MARKETING.MOCK.TITLE' | translate }}</div>
              <div class="mock__chip">{{ 'MARKETING.MOCK.LIVE' | translate }}</div>
            </div>

            <div class="mock__body">
              <div class="chat">
                <div class="msg me">
                  <div class="msg__bubble">{{ 'MARKETING.MOCK.CHAT.ME1.TEXT' | translate }}</div>
                  <div class="msg__meta">{{ 'MARKETING.MOCK.CHAT.ME1.META' | translate }}</div>
                </div>

                <div class="msg bot">
                  <div class="msg__bubble" [innerHTML]="'MARKETING.MOCK.CHAT.BOT1.TEXT_HTML' | translate"></div>
                  <div class="msg__meta">{{ 'MARKETING.MOCK.CHAT.BOT1.META' | translate }}</div>
                </div>

                <div class="msg me">
                  <div class="msg__bubble">{{ 'MARKETING.MOCK.CHAT.ME2.TEXT' | translate }}</div>
                  <div class="msg__meta">{{ 'MARKETING.MOCK.CHAT.ME2.META' | translate }}</div>
                </div>

                <div class="msg bot">
                  <div class="msg__bubble" [innerHTML]="'MARKETING.MOCK.CHAT.BOT2.TEXT_HTML' | translate"></div>
                  <div class="msg__meta">{{ 'MARKETING.MOCK.CHAT.BOT2.META' | translate }}</div>
                </div>
              </div>

              <div class="mini-panel">
                <div class="mini-panel__head">
                  <div class="mini-panel__k muted">{{ 'MARKETING.MOCK.PANEL.K' | translate }}</div>
                  <div class="mini-panel__n">R$ 4.820</div>
                </div>
                <div class="mini-bars">
                  <span style="--h: 62"></span>
                  <span style="--h: 44"></span>
                  <span style="--h: 72"></span>
                  <span style="--h: 58"></span>
                  <span style="--h: 80"></span>
                </div>
              </div>
            </div>

            <div class="mock__glow" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      <div class="hero__fade" aria-hidden="true"></div>
    </section>

    <!-- STORIES -->
    <section id="stories" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">{{ 'MARKETING.STORIES.TITLE' | translate }}</h2>
        <p class="muted">{{ 'MARKETING.STORIES.SUB' | translate }}</p>
      </div>

      <div class="storiesOne" *ngIf="stories().length">
        <div class="storyStage" [attr.aria-label]="'MARKETING.STORIES.TITLE' | translate">
          <div
            class="storyCard"
            [class.is-paused]="storyPaused()"
            (pointerenter)="pauseStories()"
            (pointerleave)="resumeStories()"
            (pointerdown)="pauseStories()"
            (pointerup)="resumeStories()"
            (pointercancel)="resumeStories()"
            (click)="onStoryClick($event)"
            role="group"
            [attr.aria-label]="'MARKETING.STORIES.TITLE' | translate"
          >
            <div class="storyTop" aria-hidden="true">
              <div class="bars" [style.gridTemplateColumns]="'repeat(' + stories().length + ', 1fr)'">
                <div
                  class="bar"
                  *ngFor="let s of stories(); let i = index"
                  [class.is-done]="i < storyIndex()"
                  [class.is-active]="i === storyIndex()"
                >
                  <span class="barFill"></span>
                </div>
              </div>
            </div>

            <img
              class="storyImg"
              [src]="stories()[storyIndex()].src"
              [alt]="stories()[storyIndex()].alt | translate"
              loading="eager"
              draggable="false"
            />

            <div class="storyFade" aria-hidden="true"></div>
          </div>
        </div>

        <div class="storiesHint muted">{{ 'MARKETING.STORIES.HINT' | translate }}</div>
      </div>
    </section>

    <!-- ONBOARDING -->
    <section id="onboarding" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <span class="kicker">{{ 'MARKETING.ONBOARDING.KICKER' | translate }}</span>
        <h2 class="h2">{{ 'MARKETING.ONBOARDING.TITLE' | translate }}</h2>
        <p class="muted">{{ 'MARKETING.ONBOARDING.SUB' | translate }}</p>
      </div>

      <div class="onboarding-opts">
        <div class="onboarding-opt">
          <span class="onboarding-opt__ic" aria-hidden="true">💰</span>
          <span class="onboarding-opt__t">{{ 'MARKETING.ONBOARDING.OPT1' | translate }}</span>
        </div>
        <div class="onboarding-opt">
          <span class="onboarding-opt__ic" aria-hidden="true">📅</span>
          <span class="onboarding-opt__t">{{ 'MARKETING.ONBOARDING.OPT2' | translate }}</span>
        </div>
        <div class="onboarding-opt">
          <span class="onboarding-opt__ic" aria-hidden="true">🚀</span>
          <span class="onboarding-opt__t">{{ 'MARKETING.ONBOARDING.OPT3' | translate }}</span>
        </div>
        <div class="onboarding-opt">
          <span class="onboarding-opt__ic" aria-hidden="true">🧠</span>
          <span class="onboarding-opt__t">{{ 'MARKETING.ONBOARDING.OPT4' | translate }}</span>
        </div>
      </div>

      <div class="onboarding-promise">
        <span class="onboarding-promise__ic" aria-hidden="true">⚡</span>
        <span>{{ 'MARKETING.ONBOARDING.PROMISE' | translate }}</span>
      </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section id="como-funciona" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">{{ 'MARKETING.HOW.TITLE' | translate }}</h2>
        <p class="muted">{{ 'MARKETING.HOW.SUB' | translate }}</p>
      </div>

      <div class="steps">
        <mira-ui-card class="step">
          <div class="step__inner">
            <div class="step__n">01</div>
            <div class="step__t">{{ 'MARKETING.HOW.STEPS.S1.T' | translate }}</div>
            <div class="step__d muted">{{ 'MARKETING.HOW.STEPS.S1.D' | translate }}</div>
          </div>
        </mira-ui-card>

        <mira-ui-card class="step">
          <div class="step__inner">
            <div class="step__n">02</div>
            <div class="step__t">{{ 'MARKETING.HOW.STEPS.S2.T' | translate }}</div>
            <div class="step__d muted">{{ 'MARKETING.HOW.STEPS.S2.D' | translate }}</div>
          </div>
        </mira-ui-card>

        <mira-ui-card class="step">
          <div class="step__inner">
            <div class="step__n">03</div>
            <div class="step__t">{{ 'MARKETING.HOW.STEPS.S3.T' | translate }}</div>
            <div class="step__d muted">{{ 'MARKETING.HOW.STEPS.S3.D' | translate }}</div>
          </div>
        </mira-ui-card>
      </div>
    </section>

    <!-- BENEFÍCIOS -->
    <section class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">{{ 'MARKETING.BENEFITS.TITLE' | translate }}</h2>
        <p class="muted">{{ 'MARKETING.BENEFITS.SUB' | translate }}</p>
      </div>

      <div class="benefits">
        <mira-ui-card class="benefit" *ngFor="let b of benefits(); let i = index">
          <div class="benefit__inner">
            <div class="benefit__ic" [attr.aria-label]="b.title | translate">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  [attr.d]="b.path"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </div>
            <div class="benefit__t">{{ b.title | translate }}</div>
            <div class="benefit__d muted">{{ b.desc | translate }}</div>
          </div>
        </mira-ui-card>
      </div>
    </section>

    <!-- CROSS INSIGHTS -->
    <section id="crossinsights" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <span class="kicker">{{ 'MARKETING.CROSSINSIGHTS.KICKER' | translate }}</span>
        <h2 class="h2">{{ 'MARKETING.CROSSINSIGHTS.TITLE' | translate }}</h2>
        <p class="muted">{{ 'MARKETING.CROSSINSIGHTS.SUB' | translate }}</p>
      </div>

      <div class="crossinsights">
        <mira-ui-card class="ci-card">
          <div class="ci-card__inner">
            <span class="ci-card__ic" aria-hidden="true">🌙</span>
            <p class="ci-card__t">{{ 'MARKETING.CROSSINSIGHTS.I1' | translate }}</p>
          </div>
        </mira-ui-card>

        <mira-ui-card class="ci-card">
          <div class="ci-card__inner">
            <span class="ci-card__ic" aria-hidden="true">📆</span>
            <p class="ci-card__t">{{ 'MARKETING.CROSSINSIGHTS.I2' | translate }}</p>
          </div>
        </mira-ui-card>

        <mira-ui-card class="ci-card">
          <div class="ci-card__inner">
            <span class="ci-card__ic" aria-hidden="true">📈</span>
            <p class="ci-card__t">{{ 'MARKETING.CROSSINSIGHTS.I3' | translate }}</p>
          </div>
        </mira-ui-card>
      </div>

      <p class="crossinsights__note muted">{{ 'MARKETING.CROSSINSIGHTS.NOTE' | translate }}</p>
    </section>

    <!-- PROVA -->
    <section id="prova" class="section container" miraRevealOnScroll>
      <div class="proof">
        <div class="proof__copy">
          <h2 class="h2">{{ 'MARKETING.PROOF.TITLE' | translate }}</h2>
          <p class="muted">{{ 'MARKETING.PROOF.SUB' | translate }}</p>

          <div class="proof__bullets">
            <div class="pb"><span class="pb__dot"></span> {{ 'MARKETING.PROOF.BULLETS.B1' | translate }}</div>
            <div class="pb"><span class="pb__dot"></span> {{ 'MARKETING.PROOF.BULLETS.B2' | translate }}</div>
            <div class="pb"><span class="pb__dot"></span> {{ 'MARKETING.PROOF.BULLETS.B3' | translate }}</div>
          </div>
        </div>

        <div class="proof__grid">
          <mira-ui-card class="proofCard">
            <div class="pc__n">{{ proofA() }}</div>
            <div class="muted pc__t">{{ 'MARKETING.PROOF.CARDS.C1' | translate }}</div>
          </mira-ui-card>
          <mira-ui-card class="proofCard">
            <div class="pc__n">{{ proofB() }}</div>
            <div class="muted pc__t">{{ 'MARKETING.PROOF.CARDS.C2' | translate }}</div>
          </mira-ui-card>
          <mira-ui-card class="proofCard">
            <div class="pc__n">{{ proofC() }}</div>
            <div class="muted pc__t">{{ 'MARKETING.PROOF.CARDS.C3' | translate }}</div>
          </mira-ui-card>
        </div>
      </div>
    </section>

    <!-- DEPOIMENTOS -->
    <section id="avaliacoes" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">{{ 'MARKETING.TESTIMONIALS.TITLE' | translate }}</h2>
        <p class="muted">{{ 'MARKETING.TESTIMONIALS.SUB' | translate }}</p>
      </div>

      <mira-ui-card class="testi">
        <div class="testi__inner">
          <div class="stars" aria-hidden="true">★★★★★</div>

          <div class="swap" [@slideSwap]="active()">
            <div class="quote">"{{ testimonials()[active()].quote | translate }}"</div>

            <div class="who">
              <div class="who__name">
                {{ testimonials()[active()].name | translate }}
                <span class="badge" *ngIf="testimonials()[active()].verified">
                  ✓ {{ 'MARKETING.TESTIMONIALS.VERIFIED' | translate }}
                </span>
              </div>

              <div class="who__role muted">
                {{ testimonials()[active()].role | translate }} • {{ testimonials()[active()].city | translate }}
              </div>
            </div>
          </div>

          <div class="dots" role="tablist" [attr.aria-label]="'MARKETING.TESTIMONIALS.TITLE' | translate">
            <button
              *ngFor="let t of testimonials(); let i = index"
              class="dot-btn focus-ring"
              type="button"
              [class.is-active]="i === active()"
              (click)="active.set(i)"
              [attr.aria-label]="('MARKETING.TESTIMONIALS.ARIA' | translate:{ n: i + 1 })"
            ></button>
          </div>
        </div>
      </mira-ui-card>
    </section>

    <!-- PRICING -->
    <section id="pricing" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <span class="kicker">{{ 'MARKETING.PRICING.KICKER' | translate }}</span>
        <h2 class="h2">{{ 'MARKETING.PRICING.TITLE' | translate }}</h2>
        <p class="muted">{{ 'MARKETING.PRICING.SUB' | translate }}</p>
      </div>

      <div class="pricing-grid">
        <!-- Free -->
        <mira-ui-card class="pricing-card">
          <div class="pricing-card__inner">
            <div class="pricing-card__top">
              <div class="pricing-card__name">{{ 'MARKETING.PRICING.FREE.NAME' | translate }}</div>
              <div class="pricing-card__price">{{ 'MARKETING.PRICING.FREE.PRICE' | translate }}</div>
              <div class="pricing-card__desc muted">{{ 'MARKETING.PRICING.FREE.DESC' | translate }}</div>
            </div>

            <ul class="pricing-card__list">
              <li>{{ 'MARKETING.PRICING.FREE.I1' | translate }}</li>
              <li>{{ 'MARKETING.PRICING.FREE.I2' | translate }}</li>
              <li>{{ 'MARKETING.PRICING.FREE.I3' | translate }}</li>
            </ul>

            <button class="cta-secondary focus-ring pricing-card__btn" type="button" (click)="openPlan('free')">
              {{ 'MARKETING.PRICING.CTA_FREE' | translate }}
            </button>
          </div>
        </mira-ui-card>

        <!-- Pro -->
        <mira-ui-card class="pricing-card pricing-card--pro">
          <div class="pricing-card__badge pricing-card__badge--floating">
            {{ 'MARKETING.PRICING.PRO.BADGE' | translate }}
          </div>

          <div class="pricing-card__inner">
            <div class="pricing-card__top">
              <div class="pricing-card__name">{{ 'MARKETING.PRICING.PRO.NAME' | translate }}</div>
              <div class="pricing-card__price">
                {{ 'MARKETING.PRICING.PRO.PRICE' | translate }}<span class="pricing-card__period">{{ 'MARKETING.PRICING.PRO.PERIOD' | translate }}</span>
              </div>
              <div class="pricing-card__desc muted">{{ 'MARKETING.PRICING.PRO.DESC' | translate }}</div>
            </div>

            <ul class="pricing-card__list">
              <li>{{ 'MARKETING.PRICING.PRO.I1' | translate }}</li>
              <li>{{ 'MARKETING.PRICING.PRO.I2' | translate }}</li>
              <li>{{ 'MARKETING.PRICING.PRO.I3' | translate }}</li>
              <li>{{ 'MARKETING.PRICING.PRO.I4' | translate }}</li>
            </ul>

            <button class="cta-primary focus-ring pricing-card__btn" type="button" (click)="openPlan('pro')">
              <span class="cta-primary__shine" aria-hidden="true"></span>
              <span class="cta-primary__text">{{ 'MARKETING.PRICING.CTA_PRO' | translate }}</span>
              <span class="cta-primary__arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </mira-ui-card>

        <!-- Elite -->
        <mira-ui-card class="pricing-card">
          <div class="pricing-card__inner">
            <div class="pricing-card__top">
              <div class="pricing-card__name">{{ 'MARKETING.PRICING.ELITE.NAME' | translate }}</div>
              <div class="pricing-card__price">
                {{ 'MARKETING.PRICING.ELITE.PRICE' | translate }}<span class="pricing-card__period">{{ 'MARKETING.PRICING.ELITE.PERIOD' | translate }}</span>
              </div>
              <div class="pricing-card__desc muted">{{ 'MARKETING.PRICING.ELITE.DESC' | translate }}</div>
            </div>

            <ul class="pricing-card__list">
              <li>{{ 'MARKETING.PRICING.ELITE.I1' | translate }}</li>
              <li>{{ 'MARKETING.PRICING.ELITE.I2' | translate }}</li>
              <li>{{ 'MARKETING.PRICING.ELITE.I3' | translate }}</li>
              <li>{{ 'MARKETING.PRICING.ELITE.I4' | translate }}</li>
            </ul>

            <button class="cta-secondary focus-ring pricing-card__btn" type="button" (click)="openPlan('elite')">
              {{ 'MARKETING.PRICING.CTA_ELITE' | translate }}
            </button>
          </div>
        </mira-ui-card>
      </div>

      <div class="founding-banner">
        <span class="founding-banner__ic" aria-hidden="true">🎁</span>
        <div class="founding-banner__copy">
          <strong class="founding-banner__t">{{ 'MARKETING.PRICING.FOUNDING_TITLE' | translate }}</strong>
          <p class="founding-banner__d muted">{{ 'MARKETING.PRICING.FOUNDING_DESC' | translate }}</p>
        </div>
        <button class="cta-primary focus-ring" type="button" (click)="openPlan('pro')">
          <span class="cta-primary__shine" aria-hidden="true"></span>
          <span class="cta-primary__text">{{ 'MARKETING.PRICING.FOUNDING_CTA' | translate }}</span>
          <span class="cta-primary__arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">{{ 'MARKETING.FAQ.TITLE' | translate }}</h2>
        <p class="muted">{{ 'MARKETING.FAQ.SUB' | translate }}</p>
      </div>

      <div class="faq">
        <details class="qa">
          <summary>{{ 'MARKETING.FAQ.Q1.Q' | translate }}</summary>
          <div class="qa__content">
            <p class="muted">{{ 'MARKETING.FAQ.Q1.A' | translate }}</p>
          </div>
        </details>

        <details class="qa">
          <summary>{{ 'MARKETING.FAQ.Q2.Q' | translate }}</summary>
          <div class="qa__content">
            <p class="muted">{{ 'MARKETING.FAQ.Q2.A' | translate }}</p>
          </div>
        </details>

        <details class="qa">
          <summary>{{ 'MARKETING.FAQ.Q3.Q' | translate }}</summary>
          <div class="qa__content">
            <p class="muted">{{ 'MARKETING.FAQ.Q3.A' | translate }}</p>
          </div>
        </details>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="cta container" miraRevealOnScroll>
      <mira-ui-card class="ctaCard">
        <div class="ctaCard__inner">
          <div class="cta__copy">
            <div class="cta__title">{{ 'MARKETING.CTA_FINAL.TITLE' | translate }}</div>
            <div class="muted">{{ 'MARKETING.CTA_FINAL.SUB' | translate }}</div>
          </div>

          <button class="cta-primary focus-ring" type="button" (click)="openPlan('pro')">
            <span class="cta-primary__shine" aria-hidden="true"></span>
            <span class="cta-primary__text">{{ 'MARKETING.CTA_FINAL.BUTTON' | translate }}</span>
            <span class="cta-primary__arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </mira-ui-card>
    </section>

    <!-- MODAL -->
    <div
      class="planModal"
      *ngIf="planOpen()"
      (click)="closePlan()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="selectedPlan().title"
    >
      <mira-ui-card class="planModal__card" (click)="$event.stopPropagation()">
        <button
          class="planModal__close focus-ring"
          type="button"
          (click)="closePlan()"
          [attr.aria-label]="'COMMON.CLOSE' | translate"
        >
          ×
        </button>

        <div class="planModal__inner">
          <div class="planModal__grid">
            <div class="planModal__main">
              <div class="planModal__head">
                <div class="planModal__k">{{ selectedPlan().eyebrow }}</div>
                <div class="planModal__h">{{ selectedPlan().title }}</div>
                <div class="planModal__p muted">{{ selectedPlan().desc }}</div>
              </div>

              <div class="planModal__list">
                <div class="planModal__li" *ngFor="let item of selectedPlan().items">
                  <span class="li__ic" aria-hidden="true">✓</span>
                  <span class="li__t">{{ item }}</span>
                </div>
              </div>
            </div>

            <div class="planModal__side">
              <div class="planModal__price">{{ selectedPlan().price }}</div>
              <div class="planModal__fine muted">{{ selectedPlan().fine }}</div>

              <a class="planModal__cta focus-ring" [routerLink]="selectedPlan().ctaLink">
                <span>{{ selectedPlan().cta }}</span>
                <span aria-hidden="true">→</span>
              </a>

              <button class="planModal__ghost focus-ring" type="button" (click)="closePlan()">
                {{ 'MARKETING.PLAN.BACK' | translate }}
              </button>
            </div>
          </div>
        </div>
      </mira-ui-card>
    </div>
  `,
  styles: [
    `
      .section { padding: 54px 0; }
      .section__head { margin-bottom: 16px; }
      .h2 { font-size: 28px; margin: 0; letter-spacing: -0.4px; }
      .container { scroll-margin-top: 86px; }

      .hero { padding: 72px 0 34px; position: relative; overflow: hidden; }
      .hero__inner { display: grid; grid-template-columns: 1fr; gap: 22px; align-items: center; }

      .pill {
        display: inline-flex; align-items: center; gap: 10px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.05);
        color: var(--muted);
        border-radius: 999px;
        padding: 8px 12px;
        width: fit-content;
        font-size: 13px;
      }
      .pill .dot {
        width: 10px; height: 10px; border-radius: 999px;
        background: linear-gradient(90deg, var(--brand-2), var(--brand));
        box-shadow: 0 10px 30px rgba(133,94,217,0.30);
      }

      .h1 {
        font-size: clamp(34px, 4.4vw, 58px);
        line-height: 1.02;
        margin: 14px 0 10px;
        letter-spacing: -1px;
        font-weight: 950;
      }
      .grad {
        background: linear-gradient(90deg, var(--brand-2), var(--brand));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .sub { font-size: 16px; max-width: 60ch; }

      .trust {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        max-width: 560px;
      }
      .trust__item {
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.04);
        border-radius: 18px;
        padding: 12px;
        display: grid;
        gap: 2px;
      }
      .trust__k { font-size: 12px; color: var(--muted); }
      .trust__v { font-weight: 900; letter-spacing: -0.2px; }

      .hero__cta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 32px; }

      .cta-primary {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 999px;
        border: 1px solid rgba(133, 94, 217, 0.45);
        background: linear-gradient(90deg, rgba(132,210,244,0.18), rgba(133,94,217,0.18));
        color: var(--text);
        box-shadow: 0 18px 50px rgba(0,0,0,0.22);
        overflow: hidden;
        transform: translateZ(0);
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        will-change: transform;
        cursor: pointer;
      }
      .cta-primary:hover {
        transform: translateY(-1px);
        border-color: rgba(132,210,244,0.55);
        box-shadow: 0 24px 70px rgba(0,0,0,0.28);
      }
      .cta-primary__shine {
        position: absolute;
        inset: -40% -30%;
        background: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.22), transparent 42%);
        transform: rotate(18deg);
        opacity: 0.9;
        pointer-events: none;
        animation: shine 3.2s ease-in-out infinite;
      }
      @keyframes shine {
        0%, 100% { transform: translateX(-6%) rotate(18deg); opacity: 0.75; }
        50% { transform: translateX(6%) rotate(18deg); opacity: 1; }
      }
      .cta-primary__text { font-weight: 900; letter-spacing: -0.1px; }
      .cta-primary__arrow { opacity: 0.9; }

      .cta-secondary {
        padding: 12px 14px;
        border-radius: 999px;
        border: 1px solid transparent;
        color: var(--muted);
        transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
      }
      .cta-secondary:hover { border-color: var(--border); background: rgba(255,255,255,0.04); color: var(--text); }

      .bullets {
        margin-top: 14px;
        display: grid;
        gap: 10px;
        max-width: 56ch;
      }
      .b { display: flex; align-items: flex-start; gap: 12px; color: var(--muted); line-height: 1.3; }
      .b__ic {
        flex: 0 0 auto;
        width: 22px; height: 22px; margin-top: 2px;
        border-radius: 999px;
        display: grid; place-items: center;
        border: 1px solid rgba(132, 210, 244, 0.35);
        background: rgba(132, 210, 244, 0.12);
        color: rgba(255, 255, 255, 0.92);
        box-shadow: 0 10px 30px rgba(132, 210, 244, 0.10);
      }

      .hero__visual .mock {
        border-radius: 28px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.05);
        box-shadow: var(--shadow);
        overflow: hidden;
        position: relative;
      }
      .mock__top { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .mock__title { font-size: 12px; color: var(--muted); }
      .mock__chip { margin-left: auto; font-size: 12px; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: var(--muted); }
      .dots { display: inline-flex; gap: 6px; margin-right: 6px; }
      .dots span { width: 10px; height: 10px; border-radius: 999px; background: rgba(255,255,255,0.18); }
      .mock__body { padding: 14px; display: grid; gap: 14px; }

      .chat { display: grid; gap: 10px; }
      .msg { display: grid; gap: 4px; }
      .msg__bubble {
        width: fit-content;
        max-width: 92%;
        padding: 10px 12px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        line-height: 1.35;
        font-size: 13px;
      }
      .msg__meta { font-size: 11px; color: var(--muted); }
      .msg.me { justify-items: end; }
      .msg.me .msg__bubble { background: linear-gradient(180deg, rgba(133,94,217,0.18), rgba(255,255,255,0.03)); border-color: rgba(133,94,217,0.28); }
      .msg.bot .msg__bubble { background: linear-gradient(180deg, rgba(132,210,244,0.12), rgba(255,255,255,0.03)); border-color: rgba(132,210,244,0.22); }

      .mini-panel { border-radius: 22px; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.03); padding: 12px; }
      .mini-panel__head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
      .mini-panel__n { font-weight: 950; letter-spacing: -0.3px; font-size: 20px; }
      .mini-bars { margin-top: 10px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; align-items: end; height: 58px; }
      .mini-bars span {
        height: calc(var(--h) * 1%);
        border-radius: 12px;
        border: 1px solid rgba(133,94,217,0.25);
        background: linear-gradient(180deg, rgba(133,94,217,0.25), rgba(132,210,244,0.14));
      }
      .mock__glow {
        position: absolute;
        inset: -20%;
        background:
          radial-gradient(600px 380px at 30% 20%, rgba(133,94,217,0.20), transparent 60%),
          radial-gradient(520px 340px at 70% 40%, rgba(132,210,244,0.14), transparent 60%);
        pointer-events: none;
        filter: blur(8px);
        opacity: 0.8;
      }

      .hero__fade { position: absolute; left: 0; right: 0; bottom: -2px; height: 120px; background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.10)); pointer-events: none; }

      .storiesOne { margin-top: 12px; }
      :host{
        --story-w: min(420px, 92vw);
        --story-h: calc(var(--story-w) * 16 / 9);
        --story-ms: 4200ms;
      }
      @media (min-width: 980px){
        :host{ --story-w: 380px; }
      }
      .storyStage{
        display: grid;
        place-items: center;
        width: fit-content;
        margin-inline: auto;
      }
      .storyCard{
        width: var(--story-w);
        height: var(--story-h);
        border-radius: 28px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.04);
        overflow: hidden;
        position: relative;
        box-shadow: var(--shadow);
        isolation: isolate;
        cursor: pointer;
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      .storyTop{
        position: absolute;
        left: 14px;
        right: 14px;
        top: 12px;
        z-index: 3;
        pointer-events: none;
      }
      .bars{ display: grid; gap: 8px; }
      .bar{
        height: 3px;
        border-radius: 999px;
        background: rgba(255,255,255,0.18);
        overflow: hidden;
      }
      .barFill{
        display: block;
        height: 100%;
        width: 100%;
        transform-origin: left center;
        transform: scaleX(0);
        background: rgba(255,255,255,0.78);
        will-change: transform;
      }
      .bar.is-done .barFill{ transform: scaleX(1); }
      .bar.is-active .barFill{ animation: storyFill var(--story-ms) linear forwards; }
      .storyCard.is-paused .bar.is-active .barFill{ animation-play-state: paused; }
      @keyframes storyFill{ from{ transform: scaleX(0); } to{ transform: scaleX(1); } }

      .storyImg{ width: 100%; height: 100%; object-fit: cover; user-select: none; pointer-events: none; }
      .storyFade{
        position: absolute; inset: auto 0 0 0;
        height: 44%;
        z-index: 2;
        pointer-events: none;
        background: linear-gradient(to top, rgba(0,0,0,0.36), transparent);
      }
      .storiesHint{ margin-top: 10px; font-size: 12px; text-align: center; }

      .steps { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 14px; }
      .step__inner { padding: 16px; display: grid; gap: 8px; }
      .step__n { width: fit-content; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: var(--muted); font-size: 12px; }
      .step__t { font-weight: 950; letter-spacing: -0.2px; }
      .step__d { font-size: 13px; }

      .benefits { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 14px; }
      .benefit__inner { padding: 16px; display: grid; gap: 10px; }
      .benefit__ic { width: 44px; height: 44px; border-radius: 16px; display: grid; place-items: center; border: 1px solid rgba(133,94,217,0.22); background: rgba(133,94,217,0.14); color: var(--text); }
      .benefit__ic svg { width: 22px; height: 22px; }
      .benefit__t { font-weight: 950; letter-spacing: -0.2px; }
      .benefit__d { font-size: 13px; max-width: 64ch; overflow-wrap: anywhere; }

      .proof { display: grid; grid-template-columns: 1fr; gap: 12px; align-items: start; }
      .proof__bullets { margin-top: 12px; display: grid; gap: 10px; }
      .pb { display: flex; align-items: center; gap: 10px; color: var(--muted); }
      .pb__dot { width: 10px; height: 10px; border-radius: 999px; background: linear-gradient(90deg, var(--brand-2), var(--brand)); }
      .proof__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      .proofCard .pc__n { padding: 16px 16px 0; font-weight: 950; font-size: 28px; letter-spacing: -0.4px; line-height: 1; }
      .proofCard .pc__t { padding: 6px 16px 16px; font-size: 12px; }

      .testi__inner { padding: 18px; overflow: hidden; }
      .stars { color: rgba(255,255,255,0.82); letter-spacing: 1px; font-size: 12px; }
      .quote { margin-top: 10px; font-size: 16px; font-weight: 800; letter-spacing: -0.2px; }
      .who { margin-top: 12px; }
      .who__name { font-weight: 950; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      .who__role { font-size: 12px; margin-top: 2px; }
      .badge { font-size: 12px; border: 1px solid rgba(132,210,244,0.35); background: rgba(132,210,244,0.10); color: var(--text); padding: 4px 10px; border-radius: 999px; }
      .dots { margin-top: 14px; display: flex; gap: 8px; align-items: center; }
      .dot-btn { width: 10px; height: 10px; border-radius: 999px; border: 1px solid var(--border); background: rgba(255,255,255,0.10); cursor: pointer; }
      .dot-btn.is-active { background: linear-gradient(90deg, var(--brand-2), var(--brand)); border-color: rgba(133,94,217,0.5); }

      .cta { padding-bottom: 72px; }
      .ctaCard { display:block; }
      .ctaCard__inner{
        padding: 20px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .cta__title { font-weight: 950; font-size: 18px; letter-spacing: -0.2px; }
      .cta__copy{ display:grid; gap: 6px; min-width: min(520px, 100%); }

      .planModal{
        position: fixed;
        inset: 0;
        z-index: 120;
        background: rgba(0,0,0,0.58);
        backdrop-filter: blur(12px);
        display: grid;
        place-items: center;
        padding: 20px;
      }

      .planModal__card{
        width: min(920px, 100%);
        border-radius: 26px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(20,20,28,0.82);
        box-shadow: 0 28px 80px rgba(0,0,0,0.35);
        position: relative;
        overflow: hidden;
      }

      .planModal__close{
        position: absolute;
        top: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        color: var(--text);
        font-size: 22px;
        cursor: pointer;
        z-index: 2;
      }

      .planModal__inner{
        padding: 26px;
      }

      .planModal__grid{
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
        gap: 28px;
        align-items: start;
      }

      .planModal__main{
        display: grid;
        gap: 20px;
        align-content: start;
        min-width: 0;
      }

      .planModal__head{
        max-width: 540px;
        padding-right: 12px;
      }

      .planModal__k{
        color: var(--brand-2);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .planModal__h{
        font-weight: 950;
        letter-spacing: -0.8px;
        font-size: clamp(30px, 3.2vw, 48px);
        line-height: 1.05;
        margin-top: 10px;
        max-width: 12ch;
      }

      .planModal__p{
        margin-top: 10px;
        font-size: 15px;
        line-height: 1.55;
        max-width: 42ch;
      }

      .planModal__list{
        display: grid;
        gap: 14px;
        align-content: start;
        max-width: 520px;
      }

      .planModal__li{
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .li__ic{
        flex: 0 0 auto;
        width: 22px;
        height: 22px;
        margin-top: 1px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(133, 94, 217, 0.35);
        background: rgba(133, 94, 217, 0.14);
        color: rgba(255, 255, 255, 0.92);
        font-weight: 900;
        font-size: 12px;
        line-height: 1;
      }

      .li__t{
        font-size: 14px;
        color: var(--muted);
        line-height: 1.45;
      }

      .planModal__side{
        align-self: start;
        margin-top: 64px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        border-radius: 22px;
        padding: 20px;
        display: grid;
        gap: 12px;
      }

      .planModal__price{
        font-size: clamp(34px, 4vw, 56px);
        font-weight: 950;
        letter-spacing: -1px;
        line-height: 0.95;
      }

      .planModal__fine{
        font-size: 12px;
        line-height: 1.45;
      }

      .planModal__cta{
        margin-top: 8px;
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 999px;
        border: 1px solid rgba(133,94,217,0.45);
        background: rgba(255,255,255,0.06);
        transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
      }

      .planModal__cta:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.10);
        border-color: rgba(132,210,244,0.55);
      }

      .planModal__ghost{
        padding: 12px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.12);
        background: transparent;
        color: var(--muted);
        cursor: pointer;
      }

      .planModal__ghost:hover{
        background: rgba(255,255,255,0.06);
        color: var(--text);
      }

      @media (max-width: 900px){
        .planModal__card{
          width: min(760px, 100%);
        }

        .planModal__grid{
          grid-template-columns: 1fr;
          gap: 22px;
        }

        .planModal__side{
          margin-top: 0;
        }

        .planModal__head{
          max-width: 100%;
          padding-right: 44px;
        }

        .planModal__h{
          max-width: 100%;
          font-size: clamp(28px, 6vw, 42px);
        }

        .planModal__p,
        .planModal__list{
          max-width: 100%;
        }
      }

      @media (min-width: 980px) {
        .hero__inner { grid-template-columns: 1.08fr 0.92fr; }
        .steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .benefits { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .proof { grid-template-columns: 1.1fr 0.9fr; }
      }
      @media (max-width: 520px) {
        .trust { grid-template-columns: 1fr; }
        .proof__grid { grid-template-columns: 1fr; }
      }

      .faq { margin-top: 14px; display: grid; gap: 10px; }
      .qa { border: 1px solid var(--border); border-radius: 18px; padding: 12px 14px; background: rgba(255,255,255,0.04); }
      summary { cursor: pointer; font-weight: 900; }

      .qa { overflow: hidden; }
      .qa summary {
        list-style: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .qa summary::-webkit-details-marker { display: none; }

      .qa summary::after{
        content: "▾";
        opacity: .7;
        transform: rotate(0deg);
        transition: transform 220ms ease, opacity 220ms ease;
      }

      .qa__content{
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 260ms cubic-bezier(.2,.9,.2,1);
      }
      .qa__content > *{
        overflow: hidden;
        margin: 0;
        padding-top: 10px;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 200ms ease, transform 200ms ease;
      }

      .qa[open] .qa__content{ grid-template-rows: 1fr; }
      .qa[open] summary::after{ transform: rotate(180deg); opacity: 1; }
      .qa[open] .qa__content > *{ opacity: 1; transform: translateY(0); }

      @media (prefers-reduced-motion: reduce){
        .qa__content, .qa__content > *, .qa summary::after { transition: none !important; }
      }

      .kicker {
        display: inline-block;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--brand-2);
        margin-bottom: 8px;
        opacity: 0.9;
      }

      .onboarding-opts {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-top: 20px;
      }
      .onboarding-opt {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 20px 14px;
        border: 1px solid var(--border);
        border-radius: 20px;
        background: rgba(255,255,255,0.04);
        text-align: center;
        cursor: pointer;
        transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
      }
      .onboarding-opt:hover {
        border-color: rgba(133,94,217,0.45);
        background: rgba(133,94,217,0.08);
        transform: translateY(-2px);
      }
      .onboarding-opt__ic { font-size: 28px; line-height: 1; }
      .onboarding-opt__t { font-weight: 700; font-size: 14px; }
      .onboarding-promise {
        margin-top: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px;
        border: 1px solid rgba(132,210,244,0.25);
        border-radius: 14px;
        background: rgba(132,210,244,0.06);
        font-size: 14px;
        font-weight: 600;
        color: var(--brand-2);
        max-width: 480px;
      }
      .onboarding-promise__ic { font-size: 18px; }
      @media (max-width: 640px) {
        .onboarding-opts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      .crossinsights {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
        margin-top: 24px;
        align-items: stretch;
      }

      .ci-card {
        display: block;
        height: 100%;
        min-height: 170px;
      }

      .ci-card__inner {
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 14px;
        padding: 22px;
      }

      .ci-card__ic {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        font-size: 24px;
        line-height: 1;
        border-radius: 14px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.10);
      }

      .ci-card__t {
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        line-height: 1.45;
        letter-spacing: -0.2px;
      }

      .crossinsights__note {
        margin-top: 18px;
        font-size: 13px;
        font-style: italic;
      }

      @media (max-width: 700px) {
        .crossinsights {
          grid-template-columns: 1fr;
        }

        .ci-card {
          min-height: auto;
        }
      }

      .pricing-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
        margin-top: 24px;
        align-items: stretch;
      }

      .pricing-card {
        position: relative;
        height: 100%;
        min-height: 430px;
        display: block;
        overflow: visible;
      }

      .pricing-card__inner {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 28px 24px 24px;
      }

      .pricing-card__top {
        display: grid;
        gap: 10px;
        min-height: 130px;
        align-content: start;
      }

      .pricing-card__name {
        font-size: 18px;
        font-weight: 900;
        letter-spacing: -0.3px;
        line-height: 1.2;
      }

      .pricing-card__price {
        font-size: clamp(26px, 3vw, 34px);
        font-weight: 950;
        letter-spacing: -1px;
        line-height: 1;
      }

      .pricing-card__period {
        font-size: 14px;
        font-weight: 500;
        opacity: 0.72;
        margin-left: 4px;
      }

      .pricing-card__desc {
        font-size: 14px;
        line-height: 1.45;
        min-height: 42px;
      }

      .pricing-card__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 12px;
        font-size: 15px;
        line-height: 1.4;
        min-height: 152px;
      }

      .pricing-card__list li {
        position: relative;
        padding-left: 18px;
      }

      .pricing-card__list li::before {
        content: "✓";
        position: absolute;
        left: 0;
        top: 0;
        color: var(--brand-2);
        font-weight: 800;
      }

      .pricing-card__btn {
        width: 100%;
        justify-content: center;
        margin-top: auto;
      }

      .pricing-card__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(132,210,244,0.28);
        background: rgba(132,210,244,0.10);
        color: var(--brand-2);
      }

      .pricing-card__badge--floating {
        position: absolute;
        top: -12px;
        left: 24px;
        z-index: 2;
      }

      .pricing-card--pro {
        border-color: rgba(133,94,217,0.45) !important;
        background: rgba(133,94,217,0.06) !important;
        box-shadow: 0 18px 44px rgba(133,94,217,0.12);
      }

      .founding-banner {
        margin-top: 28px;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px 24px;
        border: 1px solid rgba(132,210,244,0.30);
        border-radius: 20px;
        background: rgba(132,210,244,0.06);
        flex-wrap: wrap;
      }

      .founding-banner__ic {
        font-size: 28px;
        flex-shrink: 0;
      }

      .founding-banner__copy {
        flex: 1;
        min-width: 200px;
      }

      .founding-banner__t {
        font-size: 15px;
        font-weight: 900;
      }

      .founding-banner__d {
        font-size: 13px;
        margin: 2px 0 0;
      }

      @media (max-width: 760px) {
        .pricing-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .pricing-card {
          min-height: auto;
        }

        .pricing-card__inner {
          padding: 24px 20px 20px;
        }

        .pricing-card__badge--floating {
          left: 20px;
        }

        .founding-banner {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly benefits = signal([
    {
      title: 'MARKETING.BENEFITS.ITEMS.FRICTION.TITLE',
      desc: 'MARKETING.BENEFITS.ITEMS.FRICTION.DESC',
      path: 'M20 7l-9 10-4-4',
    },
    {
      title: 'MARKETING.BENEFITS.ITEMS.CONTEXT.TITLE',
      desc: 'MARKETING.BENEFITS.ITEMS.CONTEXT.DESC',
      path: 'M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-6.5-1.4 1.4M7 17l-1.4 1.4m12.8 0L17 17M7 7l-1.4-1.4',
    },
    {
      title: 'MARKETING.BENEFITS.ITEMS.PANEL.TITLE',
      desc: 'MARKETING.BENEFITS.ITEMS.PANEL.DESC',
      path: 'M4 19V5m0 14h16M8 16v-6m4 6v-9m4 9v-4m4 4V8',
    },
    {
      title: 'MARKETING.BENEFITS.ITEMS.REMINDERS.TITLE',
      desc: 'MARKETING.BENEFITS.ITEMS.REMINDERS.DESC',
      path: 'M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7',
    },
    {
      title: 'MARKETING.BENEFITS.ITEMS.AUTO.TITLE',
      desc: 'MARKETING.BENEFITS.ITEMS.AUTO.DESC',
      path: 'M8 7h8M8 12h8M8 17h8M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2',
    },
    {
      title: 'MARKETING.BENEFITS.ITEMS.A11Y.TITLE',
      desc: 'MARKETING.BENEFITS.ITEMS.A11Y.DESC',
      path: 'M12 5a2 2 0 110 4 2 2 0 010-4Zm-5 6h10M10 11v8m4-8v8',
    },
  ]);

  readonly testimonials = signal<Testimonial[]>([
    {
      name: 'MARKETING.TESTIMONIALS.ITEMS.T1.NAME',
      role: 'MARKETING.TESTIMONIALS.ITEMS.T1.ROLE',
      city: 'MARKETING.TESTIMONIALS.ITEMS.T1.CITY',
      quote: 'MARKETING.TESTIMONIALS.ITEMS.T1.QUOTE',
      rating: 5,
      verified: true,
    },
    {
      name: 'MARKETING.TESTIMONIALS.ITEMS.T2.NAME',
      role: 'MARKETING.TESTIMONIALS.ITEMS.T2.ROLE',
      city: 'MARKETING.TESTIMONIALS.ITEMS.T2.CITY',
      quote: 'MARKETING.TESTIMONIALS.ITEMS.T2.QUOTE',
      rating: 5,
      verified: true,
    },
    {
      name: 'MARKETING.TESTIMONIALS.ITEMS.T3.NAME',
      role: 'MARKETING.TESTIMONIALS.ITEMS.T3.ROLE',
      city: 'MARKETING.TESTIMONIALS.ITEMS.T3.CITY',
      quote: 'MARKETING.TESTIMONIALS.ITEMS.T3.QUOTE',
      rating: 5,
      verified: true,
    },
    {
      name: 'MARKETING.TESTIMONIALS.ITEMS.T4.NAME',
      role: 'MARKETING.TESTIMONIALS.ITEMS.T4.ROLE',
      city: 'MARKETING.TESTIMONIALS.ITEMS.T4.CITY',
      quote: 'MARKETING.TESTIMONIALS.ITEMS.T4.QUOTE',
      rating: 5,
      verified: true,
    },
  ]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly stories = signal([
    { src: '/assets/marketing/stories/story-01.webp', alt: 'MARKETING.STORIES.ALT1' },
    { src: '/assets/marketing/stories/story-02.webp', alt: 'MARKETING.STORIES.ALT2' },
    { src: '/assets/marketing/stories/story-03.webp', alt: 'MARKETING.STORIES.ALT3' },
  ]);

  readonly storyIndex = signal(0);
  readonly storyPaused = signal(false);

  private readonly _storyMs = 4200;
  private _t: number | null = null;
  private _startedAt = 0;
  private _remaining = this._storyMs;
  private _preloaded = false;

  readonly planOpen = signal(false);
  readonly selectedPlanKey = signal<PlanKey>('pro');
  readonly selectedPlan = signal<PlanModalData>(this.buildPlanContent('pro'));

  readonly active = signal(0);
  readonly proofA = signal('0');
  readonly proofB = signal('0');
  readonly proofC = signal('0');

  constructor() {
    const testiTimer = window.setInterval(() => {
      const next = (this.active() + 1) % this.testimonials().length;
      this.active.set(next);
    }, 9000);

    afterNextRender(() => {
      this.startStories();

      const onVis = () => {
        if (document.visibilityState === 'hidden') this.stopStories();
        else this.startStories();
      };
      document.addEventListener('visibilitychange', onVis);

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.planOpen()) this.closePlan();
      };
      window.addEventListener('keydown', onKey);

      this.destroyRef.onDestroy(() => {
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('keydown', onKey);
      });

      const provaEl = document.getElementById('prova');
      if (provaEl) {
        const run = () => {
          this.countTo(this.proofA, 2);
          this.countTo(this.proofB, 3);
          this.proofC.set('0');
        };

        const ioProva = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              run();
              ioProva.disconnect();
            }
          },
          { threshold: 0.25 },
        );

        ioProva.observe(provaEl);

        this.destroyRef.onDestroy(() => {
          ioProva.disconnect();
        });
      }
    });

    this.destroyRef.onDestroy(() => {
      window.clearInterval(testiTimer);
      this.stopStories();
      document.body.style.overflow = '';
    });
  }

  private buildPlanContent(plan: PlanKey): PlanModalData {
    return {
      eyebrow: this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.EYEBROW`),
      title: this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.TITLE`),
      desc: this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.DESC`),
      price: this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.PRICE`),
      fine: this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.FINE`),
      cta: this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.CTA`),
      ctaLink: plan === 'free' ? '/register' : '/login',
      items: [
        this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.ITEMS.I1`),
        this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.ITEMS.I2`),
        this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.ITEMS.I3`),
        this.translate.instant(`MARKETING.PLAN_MODAL.${plan.toUpperCase()}.ITEMS.I4`),
      ],
    };
  }

  private preloadAllStories() {
    if (this._preloaded) return;
    this._preloaded = true;

    for (const s of this.stories()) {
      const img = new Image();
      img.src = s.src;
      (img as any).decoding = 'async';
      img.decode?.().catch(() => {});
    }
  }

  private schedule(ms: number) {
    if (this._t) window.clearTimeout(this._t);

    this._startedAt = performance.now();
    this._remaining = ms;

    this._t = window.setTimeout(() => {
      this._remaining = this._storyMs;
      const total = this.stories().length || 1;
      this.storyIndex.set((this.storyIndex() + 1) % total);
      this.schedule(this._storyMs);
    }, ms);
  }

  private startStories() {
    this.preloadAllStories();
    this.storyPaused.set(false);
    this.schedule(this._storyMs);
  }

  private stopStories() {
    this.storyPaused.set(true);
    if (this._t) window.clearTimeout(this._t);
    this._t = null;
  }

  pauseStories() {
    if (this.storyPaused()) return;

    this.storyPaused.set(true);

    const elapsed = performance.now() - this._startedAt;
    this._remaining = Math.max(0, this._remaining - elapsed);

    if (this._t) window.clearTimeout(this._t);
    this._t = null;
  }

  resumeStories() {
    if (!this.storyPaused()) return;

    this.storyPaused.set(false);

    const ms = this._remaining > 60 ? this._remaining : this._storyMs;
    this.schedule(ms);
  }

  nextStory() {
    const total = this.stories().length || 1;
    this.storyIndex.set((this.storyIndex() + 1) % total);
    this._remaining = this._storyMs;
    if (!this.storyPaused()) this.schedule(this._storyMs);
  }

  prevStory() {
    const total = this.stories().length || 1;
    this.storyIndex.set((this.storyIndex() - 1 + total) % total);
    this._remaining = this._storyMs;
    if (!this.storyPaused()) this.schedule(this._storyMs);
  }

  onStoryClick(ev: MouseEvent) {
    const el = ev.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = ev.clientX - r.left;

    if (x < r.width * 0.38) this.prevStory();
    else this.nextStory();
  }

  scrollToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }

  openPlan(plan: PlanKey = 'pro') {
    this.selectedPlanKey.set(plan);
    this.selectedPlan.set(this.buildPlanContent(plan));
    this.planOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closePlan() {
    this.planOpen.set(false);
    document.body.style.overflow = '';
  }

  private countTo(target: any, n: number) {
    const dur = 520;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const v = Math.round(n * p);
      target.set(String(v));
      if (p < 1) requestAnimationFrame(step);
      else target.set(String(n));
    };
    requestAnimationFrame(step);
  }
}