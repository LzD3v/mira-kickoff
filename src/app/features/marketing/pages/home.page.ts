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

type Testimonial = {
  name: string;
  role: string;
  city: string;
  quote: string;
  rating: 5;
  verified: boolean;
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
  ],
  animations: [
    // ✅ depoimento “passando pro lado”
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
            <span>MIRA • Assistente pessoal financeiro</span>
          </div>

          <h1 class="h1">
            Clareza no seu dinheiro.
            <span class="grad">Sem planilha</span>, sem culpa.
          </h1>

          <p class="sub muted">
            Você registra em segundos, o MIRA organiza por você e te devolve
            <b>controle</b> com uma experiência bonita, simples e prazerosa de usar.
          </p>

          <div class="trust">
            <div class="trust__item">
              <span class="trust__k">Comece rápido</span>
              <span class="trust__v">em poucos minutos</span>
            </div>
            <div class="trust__item">
              <span class="trust__k">Mobile-first</span>
              <span class="trust__v">360–1920</span>
            </div>
            <div class="trust__item">
              <span class="trust__k">Acessível</span>
              <span class="trust__v">Foco e teclado</span>
            </div>
          </div>

          <div class="hero__cta">
            <!-- ✅ agora abre o “Conheça nosso plano” -->
            <button
              class="cta-primary focus-ring"
              type="button"
              (click)="openPlan()"
              aria-label="Conhecer o plano Mira"
            >
              <span class="cta-primary__shine" aria-hidden="true"></span>
              <span class="cta-primary__text">Contratar Mira Agora</span>
              <span class="cta-primary__arrow" aria-hidden="true">→</span>
            </button>

            <a class="cta-secondary focus-ring" href="#como-funciona">Ver como funciona</a>
          </div>

          <div class="bullets">
            <div class="b"><span class="b__ic" aria-hidden="true">✓</span> Registre gastos e entradas sem esforço</div>
            <div class="b"><span class="b__ic" aria-hidden="true">↗</span> Insights que acalmam e mostram prioridade</div>
            <div class="b"><span class="b__ic" aria-hidden="true">◆</span> Painel claro — você entende o mês rápido</div>
          </div>
        </div>

        <div class="hero__visual" aria-hidden="true" @fadeUpDelay>
          <div class="mock">
            <div class="mock__top">
              <div class="dots">
                <span></span><span></span><span></span>
              </div>
              <div class="mock__title">MIRA • Demo</div>
              <div class="mock__chip">ao vivo</div>
            </div>

            <div class="mock__body">
              <div class="chat">
                <div class="msg me">
                  <div class="msg__bubble">gastei 52 no mercado</div>
                  <div class="msg__meta">agora</div>
                </div>
                <div class="msg bot">
                  <div class="msg__bubble">
                    Anotado ✅ <b>Mercado</b> • R$ 52<br />
                    Quer que eu separe em “alimentação”?
                  </div>
                  <div class="msg__meta">MIRA</div>
                </div>
                <div class="msg me">
                  <div class="msg__bubble">sim, e me lembra do aluguel dia 10</div>
                  <div class="msg__meta">agora</div>
                </div>
                <div class="msg bot">
                  <div class="msg__bubble">
                    Fechado 😌<br />
                    Lembrete criado • <b>10</b> • 9:00
                  </div>
                  <div class="msg__meta">MIRA</div>
                </div>
              </div>

              <div class="mini-panel">
                <div class="mini-panel__head">
                  <div class="mini-panel__k muted">Visão do mês</div>
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

    <!-- ✅ STORIES -->
    <section id="stories" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">Veja o MIRA em ação (stories)</h2>
        <p class="muted">Uma prévia rápida do “clima” do produto — leve, bonito e direto.</p>
      </div>

      <div class="storiesOne" *ngIf="stories().length">
        <div class="storyStage" aria-label="Stories do Mira">
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
            aria-label="Story do Mira"
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
              [alt]="stories()[storyIndex()].alt"
              loading="eager"
              draggable="false"
            />

            <div class="storyFade" aria-hidden="true"></div>
          </div>
        </div>

        <div class="storiesHint muted">Segure para pausar • Clique nas laterais para voltar/avançar</div>
      </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section id="como-funciona" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">Como o MIRA te dá controle — sem virar mais uma obrigação.</h2>
        <p class="muted">Você conversa, o MIRA organiza. Você decide. Simples assim.</p>
      </div>

      <div class="steps">
        <mira-ui-card class="step">
          <div class="step__inner">
            <div class="step__n">01</div>
            <div class="step__t">Registre em segundos</div>
            <div class="step__d muted">Texto, áudio, do seu jeito. O importante é você não desistir.</div>
          </div>
        </mira-ui-card>

        <mira-ui-card class="step">
          <div class="step__inner">
            <div class="step__n">02</div>
            <div class="step__t">Organização automática</div>
            <div class="step__d muted">Categorias, lembretes e resumos — tudo leve e fácil de acompanhar.</div>
          </div>
        </mira-ui-card>

        <mira-ui-card class="step">
          <div class="step__inner">
            <div class="step__n">03</div>
            <div class="step__t">Você enxerga o mês</div>
            <div class="step__d muted">Painel claro, gráficos bonitos e dicas que parecem feitas pra você.</div>
          </div>
        </mira-ui-card>
      </div>
    </section>

    <!-- BENEFÍCIOS -->
    <section class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">Feito pra te dar paz — e não mais ansiedade.</h2>
        <p class="muted">Design premium, leitura fácil e microinterações que passam confiança.</p>
      </div>

      <div class="benefits">
        <mira-ui-card class="benefit" *ngFor="let b of benefits(); let i = index">
          <div class="benefit__inner">
            <div class="benefit__ic" [attr.aria-label]="b.title">
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
            <div class="benefit__t">{{ b.title }}</div>
            <div class="benefit__d muted">{{ b.desc }}</div>
          </div>
        </mira-ui-card>
      </div>
    </section>

    <!-- PROVA / NÚMEROS -->
    <section id="prova" class="section container" miraRevealOnScroll>
      <div class="proof">
        <div class="proof__copy">
          <h2 class="h2">Você entende o valor em segundos.</h2>
          <p class="muted">Sem telas confusas. Só o essencial — bonito e direto.</p>

          <div class="proof__bullets">
            <div class="pb"><span class="pb__dot"></span> Texto claro e hierarquia visual forte</div>
            <div class="pb"><span class="pb__dot"></span> Navegação simples e fluida</div>
            <div class="pb"><span class="pb__dot"></span> Rotina leve (de verdade)</div>
          </div>
        </div>

        <div class="proof__grid">
          <mira-ui-card class="proofCard">
            <div class="pc__n">{{ proofA() }}</div>
            <div class="muted pc__t">min para começar</div>
          </mira-ui-card>
          <mira-ui-card class="proofCard">
            <div class="pc__n">{{ proofB() }}</div>
            <div class="muted pc__t">passos para entender o mês</div>
          </mira-ui-card>
          <mira-ui-card class="proofCard">
            <div class="pc__n">{{ proofC() }}</div>
            <div class="muted pc__t">planilhas necessárias</div>
          </mira-ui-card>
        </div>
      </div>
    </section>

    <!-- DEPOIMENTOS -->
    <section id="avaliacoes" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">Gente real. Vida real. Controle real.</h2>
        <p class="muted">O tipo de feedback que a gente quer ouvir todos os dias.</p>
      </div>

      <mira-ui-card class="testi">
        <div class="testi__inner">
          <div class="stars" aria-hidden="true">★★★★★</div>

          <div class="swap" [@slideSwap]="active()">
            <div class="quote">“{{ testimonials()[active()].quote }}”</div>

            <div class="who">
              <div class="who__name">
                {{ testimonials()[active()].name }}
                <span class="badge" *ngIf="testimonials()[active()].verified">✓ Cliente verificado</span>
              </div>
              <div class="who__role muted">
                {{ testimonials()[active()].role }} • {{ testimonials()[active()].city }}
              </div>
            </div>
          </div>

          <div class="dots" role="tablist" aria-label="Depoimentos">
            <button
              *ngFor="let t of testimonials(); let i = index"
              class="dot-btn focus-ring"
              type="button"
              [class.is-active]="i === active()"
              (click)="active.set(i)"
              [attr.aria-label]="'Ver depoimento ' + (i + 1)"
            ></button>
          </div>
        </div>
      </mira-ui-card>
    </section>

    <!-- FAQ -->
    <section id="faq" class="section container" miraRevealOnScroll>
      <div class="section__head">
        <h2 class="h2">Perguntas Frequentes</h2>
        <p class="muted">Tudo claro — do jeito que a gente gosta.</p>
      </div>

      <div class="faq">
        <details class="qa">
          <summary>O MIRA é pra mim?</summary>
          <div class="qa__content">
            <p class="muted">
              Se você quer organizar o mês sem planilha e sem stress, sim. O MIRA te ajuda a registrar, entender e decidir com mais calma.
            </p>
          </div>
        </details>

        <details class="qa">
          <summary>Preciso saber “mexer com finanças”?</summary>
          <div class="qa__content">
            <p class="muted">
              Não. A ideia é deixar simples: você fala do seu jeito e o MIRA te devolve clareza e próximos passos.
            </p>
          </div>
        </details>

        <details class="qa">
          <summary>Dá pra usar no celular?</summary>
          <div class="qa__content">
            <p class="muted">
              Sim. A experiência é pensada pra mobile: rápida, confortável e gostosa de navegar.
            </p>
          </div>
        </details>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="cta container" miraRevealOnScroll>
      <mira-ui-card class="ctaCard">
        <div class="ctaCard__inner">
          <div class="cta__copy">
            <div class="cta__title">Pronto pra sentir “meu dinheiro tá sob controle”?</div>
            <div class="muted">Contrate o MIRA e comece leve. O resto a gente organiza com você.</div>
          </div>

          <!-- ✅ agora abre o “Conheça nosso plano” -->
          <button class="cta-primary focus-ring" type="button" (click)="openPlan()">
            <span class="cta-primary__shine" aria-hidden="true"></span>
            <span class="cta-primary__text">Contratar Mira Agora</span>
            <span class="cta-primary__arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </mira-ui-card>
    </section>

    <!-- ✅ MODAL: Conheça nosso plano -->
    <div
      class="planModal"
      *ngIf="planOpen()"
      (click)="closePlan()"
      role="dialog"
      aria-modal="true"
      aria-label="Conheça nosso plano"
    >
      <mira-ui-card class="planModal__card" (click)="$event.stopPropagation()">
        <button class="planModal__close focus-ring" type="button" (click)="closePlan()" aria-label="Fechar">
          ×
        </button>

        <div class="planModal__inner">
          <div class="planModal__head">
            <div class="planModal__k">Conheça nosso plano</div>
            <div class="planModal__h">Tudo que você precisa pra cuidar do mês — sem planilha.</div>
            <div class="planModal__p muted">
              O MIRA foi feito pra você registrar rápido, entender o que está acontecendo e tomar decisões melhores com calma.
              Sem telas confusas. Sem “peso”. Só clareza.
            </div>
          </div>

          <div class="planModal__grid">
            <div class="planModal__list">
              <div class="planModal__li"><span class="li__ic" aria-hidden="true">✓</span><span class="li__t">Insights essenciais (o que importa agora)</span></div>
              <div class="planModal__li"><span class="li__ic" aria-hidden="true">✓</span><span class="li__t">Painel do dinheiro (visão clara do mês)</span></div>
              <div class="planModal__li"><span class="li__ic" aria-hidden="true">✓</span><span class="li__t">Metas e comparativos (evolução sem ansiedade)</span></div>
              <div class="planModal__li"><span class="li__ic" aria-hidden="true">✓</span><span class="li__t">Lembretes (no tempo certo)</span></div>
              <div class="planModal__li"><span class="li__ic" aria-hidden="true">✓</span><span class="li__t">Visão e organização automática (categorias e padrão)</span></div>
            </div>

            <div class="planModal__side">
              <div class="planModal__price">{{ offerPrice }}</div>
              <div class="planModal__fine muted">Cobrança mensal • Cancele quando quiser</div>

              <a class="planModal__cta focus-ring" routerLink="/login">
                <span>Continuar</span><span aria-hidden="true">→</span>
              </a>

              <button class="planModal__ghost focus-ring" type="button" (click)="closePlan()">
                Voltar
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

      /* HERO */
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

      .hero__cta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 16px; }

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

      /* VISUAL MOCK */
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

      /* STORIES — CSS progress */
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

      /* STEPS */
      .steps { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 14px; }
      .step__inner { padding: 16px; display: grid; gap: 8px; }
      .step__n { width: fit-content; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: var(--muted); font-size: 12px; }
      .step__t { font-weight: 950; letter-spacing: -0.2px; }
      .step__d { font-size: 13px; }

      /* BENEFITS */
      .benefits { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 14px; }
      .benefit__inner { padding: 16px; display: grid; gap: 10px; }
      .benefit__ic { width: 44px; height: 44px; border-radius: 16px; display: grid; place-items: center; border: 1px solid rgba(133,94,217,0.22); background: rgba(133,94,217,0.14); color: var(--text); }
      .benefit__ic svg { width: 22px; height: 22px; }
      .benefit__t { font-weight: 950; letter-spacing: -0.2px; }
      .benefit__d { font-size: 13px; max-width: 64ch; overflow-wrap: anywhere; }

      /* PROOF */
      .proof { display: grid; grid-template-columns: 1fr; gap: 12px; align-items: start; }
      .proof__bullets { margin-top: 12px; display: grid; gap: 10px; }
      .pb { display: flex; align-items: center; gap: 10px; color: var(--muted); }
      .pb__dot { width: 10px; height: 10px; border-radius: 999px; background: linear-gradient(90deg, var(--brand-2), var(--brand)); }
      .proof__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      .proofCard .pc__n { padding: 16px 16px 0; font-weight: 950; font-size: 28px; letter-spacing: -0.4px; line-height: 1; }
      .proofCard .pc__t { padding: 6px 16px 16px; font-size: 12px; }

      /* TESTI */
      .testi__inner { padding: 18px; overflow: hidden; } /* ✅ ajuda no “slide” */
      .stars { color: rgba(255,255,255,0.82); letter-spacing: 1px; font-size: 12px; }
      .quote { margin-top: 10px; font-size: 16px; font-weight: 800; letter-spacing: -0.2px; }
      .who { margin-top: 12px; }
      .who__name { font-weight: 950; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      .who__role { font-size: 12px; margin-top: 2px; }
      .badge { font-size: 12px; border: 1px solid rgba(132,210,244,0.35); background: rgba(132,210,244,0.10); color: var(--text); padding: 4px 10px; border-radius: 999px; }
      .dots { margin-top: 14px; display: flex; gap: 8px; align-items: center; }
      .dot-btn { width: 10px; height: 10px; border-radius: 999px; border: 1px solid var(--border); background: rgba(255,255,255,0.10); cursor: pointer; }
      .dot-btn.is-active { background: linear-gradient(90deg, var(--brand-2), var(--brand)); border-color: rgba(133,94,217,0.5); }

      /* CTA FINAL */
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

      /* ✅ Modal do plano */
      .planModal{
        position: fixed;
        inset: 0;
        z-index: 120;
        background: rgba(0,0,0,0.58);
        backdrop-filter: blur(14px);
        display: grid;
        place-items: center;
        padding: 18px;
      }
      .planModal__card{
        width: min(920px, 94vw);
        border-radius: 28px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.06);
        box-shadow: var(--shadow);
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
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.06);
        color: var(--text);
        font-size: 22px;
        cursor: pointer;
      }
      .planModal__inner{ padding: 22px; display: grid; gap: 16px; }
      .planModal__k{ color: var(--muted); font-size: 12px; }
      .planModal__h{ font-weight: 950; letter-spacing: -0.4px; font-size: 22px; margin-top: 4px; }
      .planModal__p{ max-width: 70ch; }
      .planModal__grid{
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 16px;
        align-items: start;
      }
      .planModal__list{ display: grid; gap: 10px; }
      .planModal__li{ display: flex; gap: 12px; align-items: flex-start; }

      .li__ic{
        flex: 0 0 auto;
        width: 20px;
        height: 20px;
        margin-top: 2px;
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
      .li__t{ font-size: 13px; color: var(--muted); line-height: 1.35; }

      .planModal__side{
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(0,0,0,0.14);
        border-radius: 22px;
        padding: 16px;
        display: grid;
        gap: 10px;
      }
      .planModal__price{
        font-size: 34px;
        font-weight: 950;
        letter-spacing: -0.6px;
        line-height: 1;
      }
      .planModal__fine{ font-size: 12px; }

      .planModal__cta{
        margin-top: 6px;
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        border-radius: 999px;
        border: 1px solid rgba(133,94,217,0.45);
        background: rgba(255,255,255,0.06);
        transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
      }
      .planModal__cta:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.10); border-color: rgba(132,210,244,0.55); }

      .planModal__ghost{
        padding: 10px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.12);
        background: transparent;
        color: var(--muted);
        cursor: pointer;
      }
      .planModal__ghost:hover{ background: rgba(255,255,255,0.06); color: var(--text); }

      @media (max-width: 820px){
        .planModal__grid{ grid-template-columns: 1fr; }
        .planModal__h{ font-size: 20px; }
      }

      /* RESPONSIVO */
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

      /* ✅ FAQ — animação suave abrir/fechar (apenas isso) */
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly benefits = signal([
    {
      title: 'Registros sem fricção',
      desc: 'Você anota do seu jeito. O MIRA mantém consistência — sem te “punir” por falhar um dia.',
      path: 'M20 7l-9 10-4-4',
    },
    {
      title: 'Insights com contexto',
      desc: 'Dicas que conversam com você: menos culpa, mais clareza e próxima ação simples.',
      path: 'M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-6.5-1.4 1.4M7 17l-1.4 1.4m12.8 0L17 17M7 7l-1.4-1.4',
    },
    {
      title: 'Painel limpo e premium',
      desc: 'Gráficos e cartões com hierarquia visual. Você bate o olho e entende.',
      path: 'M4 19V5m0 14h16M8 16v-6m4 6v-9m4 9v-4m4 4V8',
    },
    {
      title: 'Lembretes que ajudam',
      desc: 'Sem barulho. Só o que importa — no horário certo.',
      path: 'M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7',
    },
    {
      title: 'Organização automática',
      desc: 'Categorias, resumos e padrões — pra você decidir com mais calma.',
      path: 'M8 7h8M8 12h8M8 17h8M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2',
    },
    {
      title: 'Acessibilidade de verdade',
      desc: 'Foco visível, teclado e responsividade bem resolvida.',
      path: 'M12 5a2 2 0 110 4 2 2 0 010-4Zm-5 6h10M10 11v8m4-8v8',
    },
  ]);

  readonly testimonials = signal<Testimonial[]>([
    {
      name: 'Marina',
      role: 'Autônoma',
      city: 'Curitiba • PR',
      quote:
        'Parece que alguém finalmente traduziu finanças pra uma linguagem humana. Eu abro e entendo.',
      rating: 5,
      verified: true,
    },
    {
      name: 'Carlos',
      role: 'CLT',
      city: 'São Paulo • SP',
      quote:
        'O painel é direto. Sem “poluição”. Dá uma calma real ver o mês assim.',
      rating: 5,
      verified: true,
    },
    {
      name: 'Patrícia',
      role: 'Empreendedora',
      city: 'Belo Horizonte • MG',
      quote:
        'As microinterações fazem diferença. Parece produto premium — e me dá vontade de usar.',
      rating: 5,
      verified: true,
    },
    {
      name: 'Renato',
      role: 'Freela',
      city: 'Recife • PE',
      quote:
        'Eu sempre abandono app de finanças. Esse aqui… eu sinto que consigo manter.',
      rating: 5,
      verified: true,
    },
  ]);

  private readonly destroyRef = inject(DestroyRef);

  /* -----------------------------
    STORIES (CSS progress + Timer)
  ------------------------------ */
  readonly stories = signal([
    { src: '/assets/marketing/stories/story-01.webp', alt: 'Story Mira 01' },
    { src: '/assets/marketing/stories/story-02.webp', alt: 'Story Mira 02' },
    { src: '/assets/marketing/stories/story-03.webp', alt: 'Story Mira 03' },
  ]);

  readonly storyIndex = signal(0);
  readonly storyPaused = signal(false);

  private readonly _storyMs = 4200;
  private _t: number | null = null;
  private _startedAt = 0;
  private _remaining = this._storyMs;
  private _preloaded = false;

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

  /* -----------------------------
    MODAL DO PLANO (1 plano)
  ------------------------------ */
  readonly planOpen = signal(false);
  readonly offerPrice = 'R$ 25/mês';

  openPlan() {
    this.planOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closePlan() {
    this.planOpen.set(false);
    document.body.style.overflow = '';
  }

  /* Depoimentos + Prova */
  readonly active = signal(0);
  readonly proofA = signal('0');
  readonly proofB = signal('0');
  readonly proofC = signal('0');

  constructor() {
    // ✅ 8–10s pra dar tempo de ler
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