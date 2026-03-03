import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type Role = 'user' | 'assistant';
type Msg = { id: string; role: Role; text: string; at: number };

type Mode = 'quick' | 'detailed';

@Component({
  standalone: true,
  imports: [CommonModule, UiButtonComponent, TranslateModule],
  template: `
    <div class="page">
      <div class="cornerBrand" [attr.aria-label]="'CHAT.BRAND_ARIA' | translate">
        <span class="cornerBrand__name">MIRA</span>
      </div>

      <main class="content">
        <!-- EMPTY (hero) -->
        <section class="hero enter" *ngIf="messages().length === 0">
          <div class="hello">
            <img class="hello__logo" src="/assets/brand/logo/mira-mark-gradient.svg" alt="" aria-hidden="true" />
            <span class="hello__text">
              {{ 'CHAT.HELLO' | translate:{ name: userTag() } }}
            </span>
          </div>

          <h1 class="h1">{{ 'CHAT.HEADLINE' | translate }}</h1>

          <div class="prompt">
            <textarea
              class="prompt__input focus-ring"
              rows="1"
              [value]="draft()"
              (input)="draft.set(($any($event.target).value || '').toString())"
              (keydown.enter)="onEnter($event)"
              [placeholder]="'CHAT.PLACEHOLDER_EMPTY' | translate"
              autocomplete="off"
            ></textarea>

            <div class="prompt__right">
              <button
                class="miniIcon focus-ring"
                type="button"
                (click)="toggleVoice()"
                [class.is-on]="listening()"
                [attr.aria-label]="'CHAT.MIC_ARIA' | translate"
                [title]="'CHAT.MIC_TITLE' | translate"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </button>

              <button
                class="miniIcon focus-ring"
                type="button"
                (click)="toggleSimultaneous()"
                [class.is-on]="simultaneous()"
                [attr.aria-label]="'CHAT.SIM_ARIA' | translate"
                [title]="'CHAT.SIM_TITLE' | translate"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 8h10a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H13l-3 2v-2H7a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3Z"
                    stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                  <path d="M9 6h8a3 3 0 0 1 3 3v.5"
                    stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
                </svg>
              </button>

              <mira-ui-button variant="primary" (click)="send()" [disabled]="!canSend()">
                {{ 'CHAT.SEND' | translate }}
              </mira-ui-button>
            </div>

            <button
              class="prompt__plus focus-ring"
              type="button"
              [attr.aria-label]="'CHAT.MORE_ARIA' | translate"
              (click)="tools()"
              [title]="'CHAT.MORE_TITLE' | translate"
            >
              <span class="plusGlyph">+</span>
            </button>

            <div class="prompt__meta">
              <button class="modeBtn focus-ring" type="button" (click)="toggleMode()">
                <span class="modeBtn__label">
                  {{ (mode() === 'quick' ? 'CHAT.MODE.QUICK' : 'CHAT.MODE.DETAILED') | translate }}
                </span>
                <span class="modeBtn__chev" aria-hidden="true">▾</span>
              </button>
            </div>
          </div>

          <div class="chips">
            <button class="chip focus-ring" type="button" (click)="seed('CHAT.CHIPS.PROMPTS.ADJ')">
              {{ 'CHAT.CHIPS.ADJ' | translate }}
            </button>

            <button class="chip focus-ring" type="button" (click)="seed('CHAT.CHIPS.PROMPTS.SAVE')">
              {{ 'CHAT.CHIPS.SAVE' | translate }}
            </button>

            <button class="chip focus-ring" type="button" (click)="seed('CHAT.CHIPS.PROMPTS.PLAN')">
              {{ 'CHAT.CHIPS.PLAN' | translate }}
            </button>

            <button class="chip focus-ring" type="button" (click)="seed('CHAT.CHIPS.PROMPTS.CAP')">
              {{ 'CHAT.CHIPS.CAP' | translate }}
            </button>
          </div>
        </section>

        <!-- CHAT MODE -->
        <section class="chat enter" *ngIf="messages().length > 0">
          <div class="chat__scroll">
            <div class="msgs">
              <div class="msg" *ngFor="let m of messages(); trackBy: trackById" [class.is-me]="m.role === 'user'">
                <div class="bubble">{{ m.text }}</div>
              </div>
            </div>
          </div>

          <div class="composer">
            <div class="prompt prompt--compact">
              <textarea
                class="prompt__input focus-ring"
                rows="1"
                [value]="draft()"
                (input)="draft.set(($any($event.target).value || '').toString())"
                (keydown.enter)="onEnter($event)"
                [placeholder]="'CHAT.PLACEHOLDER_CHAT' | translate"
                autocomplete="off"
              ></textarea>

              <div class="prompt__right">
                <button
                  class="miniIcon focus-ring"
                  type="button"
                  (click)="toggleVoice()"
                  [class.is-on]="listening()"
                  [attr.aria-label]="'CHAT.MIC_ARIA' | translate"
                  [title]="'CHAT.MIC_TITLE' | translate"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                </button>

                <button
                  class="miniIcon focus-ring"
                  type="button"
                  (click)="toggleSimultaneous()"
                  [class.is-on]="simultaneous()"
                  [attr.aria-label]="'CHAT.SIM_ARIA' | translate"
                  [title]="'CHAT.SIM_TITLE' | translate"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 8h10a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H13l-3 2v-2H7a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3Z"
                      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                    <path d="M9 6h8a3 3 0 0 1 3 3v.5"
                      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
                  </svg>
                </button>

                <mira-ui-button variant="primary" (click)="send()" [disabled]="!canSend()">
                  {{ 'CHAT.SEND' | translate }}
                </mira-ui-button>
              </div>

              <button
                class="prompt__plus focus-ring"
                type="button"
                (click)="tools()"
                [attr.aria-label]="'CHAT.MORE_ARIA' | translate"
                [title]="'CHAT.MORE_TITLE' | translate"
              >
                <span class="plusGlyph">+</span>
              </button>

              <div class="prompt__meta">
                <button class="modeBtn focus-ring" type="button" (click)="toggleMode()">
                  <span class="modeBtn__label">
                    {{ (mode() === 'quick' ? 'CHAT.MODE.QUICK' : 'CHAT.MODE.DETAILED') | translate }}
                  </span>
                  <span class="modeBtn__chev" aria-hidden="true">▾</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      :host{
        display:block;
        height: 100%;
        overflow: hidden;
        color: rgba(255,255,255,0.92);
      }

      .page{
        height: 100%;
        overflow: hidden;
        position: relative;
        display:flex;
        flex-direction: column;
      }

      .page::before{
        content:"";
        position: absolute;
        inset: 0;
        pointer-events:none;
        background:
          radial-gradient(900px 420px at 50% 20%, rgba(124,92,255,0.18), transparent 60%),
          radial-gradient(780px 520px at 70% 35%, rgba(35,209,195,0.10), transparent 62%),
          radial-gradient(680px 460px at 25% 55%, rgba(255,92,122,0.08), transparent 60%);
        opacity: .95;
      }

      .cornerBrand{
        position: absolute;
        top: 10px;
        left: 12px;
        z-index: 3;
        pointer-events: none;
      }
      .cornerBrand__name{
        font-weight: 950;
        letter-spacing: .2px;
        font-size: 14px;
        opacity: .92;
      }

      .content{
        position: relative;
        z-index: 2;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        display:flex;
        flex-direction: column;

        max-width: 980px;
        width: 100%;
        margin: 0 auto;
        padding: 18px 0 0;
      }

      .hero{
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        display: grid;
        gap: 14px;
        justify-items: center;
        align-content: center;
        text-align: center;
        padding: 10px 8px 10px;
      }

      .hello{
        display:inline-flex;
        align-items:center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
      }
      .hello__logo{
        width: 22px;
        height: 22px;
        display:block;
        filter: drop-shadow(0 12px 30px rgba(133,94,217,0.20));
      }
      .hello__text{ font-weight: 900; letter-spacing: -0.1px; }

      .h1{
        font-size: clamp(28px, 4.6vw, 48px);
        line-height: 1.06;
        letter-spacing: -0.6px;
        margin: 0;
        font-weight: 950;
      }

      .prompt{
        width: min(900px, 100%);
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(10px);
        box-shadow: 0 26px 90px rgba(0,0,0,0.22);
        padding: 12px;

        --ctl-h: 52px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-rows: var(--ctl-h) var(--ctl-h);
        gap: 10px;
        align-items: center;
      }

      .prompt__input{
        grid-column: 1;
        grid-row: 1;
        width: 100%;
        resize: none;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(0,0,0,0.18);
        color: rgba(255,255,255,0.92);
        border-radius: 16px;

        height: var(--ctl-h);
        min-height: var(--ctl-h);

        font-size: 14px;
        line-height: 20px;

        padding: 0 12px;
        padding-top: calc((var(--ctl-h) - 20px) / 2);
        padding-bottom: calc((var(--ctl-h) - 20px) / 2);

        outline: none;
        box-sizing: border-box;
        overflow: hidden;
      }
      .prompt__input::placeholder{ color: rgba(255,255,255,0.46); }
      .prompt__input:focus{ border-color: rgba(133,94,217,0.45); }

      .prompt__right{
        grid-column: 2;
        grid-row: 1;
        display:flex;
        align-items:center;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: nowrap;
      }

      .miniIcon{
        width: var(--ctl-h);
        height: var(--ctl-h);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.92);
        cursor:pointer;
        display:grid;
        place-items:center;
        padding: 0;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
      }
      .miniIcon:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.20); }
      .miniIcon.is-on{ border-color: rgba(35,209,195,0.32); background: rgba(35,209,195,0.10); }

      .prompt__plus{
        grid-column: 1;
        grid-row: 2;
        width: var(--ctl-h);
        height: var(--ctl-h);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.92);
        cursor:pointer;
        display:grid;
        place-items:center;
        font-size: 22px;
        line-height: 0;
        padding: 0;
        justify-self: start;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        margin-right: 10px;
        margin-bottom: 10px;
      }
      .plusGlyph{
        display: inline-block;
        line-height: 1;
        transform: translate(0px, -2px);
      }
      .prompt__plus:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.20); }

      .prompt__meta{
        grid-column: 2;
        grid-row: 2;
        display:flex;
        align-items:center;
        justify-content: flex-end;
      }

      .modeBtn{
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.88);
        border-radius: 999px;
        padding: 10px 12px;
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        gap: 8px;
        font-weight: 900;
        font-size: 12.5px;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
      }
      .modeBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.20); }
      .modeBtn__chev{ opacity: .8; }

      .chips{
        display:flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 2px;
      }
      .chip{
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.90);
        border-radius: 999px;
        padding: 10px 12px;
        cursor:pointer;
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        font-weight: 900;
        font-size: 12.5px;
      }
      .chip:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.20); }

      .chat{
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        display:flex;
        flex-direction: column;
      }

      .chat__scroll{
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 8px 0 180px;
        border: 0;
        background: transparent;
        border-radius: 0;
        box-shadow: none;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .chat__scroll::-webkit-scrollbar{ width: 0; height: 0; }

      .msgs{
        max-width: 860px;
        margin: 0 auto;
        padding: 0 6px;
        display:grid;
        gap: 12px;
      }

      .msg{ display:flex; }
      .msg.is-me{ justify-content:flex-end; }

      .bubble{
        max-width: min(76ch, 88%);
        padding: 12px 12px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.035);
        line-height: 1.45;
        font-size: 13px;
      }
      .msg.is-me .bubble{
        border-color: rgba(133,94,217,0.35);
        background: linear-gradient(180deg, rgba(133,94,217,0.18), rgba(255,255,255,0.03));
      }

      .composer{
        position: sticky;
        bottom: 12px;
        z-index: 5;
        display:grid;
        gap: 8px;
        width: min(980px, 100%);
        margin: 0 auto;
        padding: 0 6px;
      }

      .prompt--compact{
        box-shadow: 0 18px 60px rgba(0,0,0,0.18);
      }

      .enter{ animation: enter 420ms cubic-bezier(.2,.8,.2,1) both; }
      @keyframes enter{
        from{ opacity: 0; transform: translateY(10px); }
        to{ opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce){
        .enter{ animation: none !important; }
        .miniIcon, .chip, .modeBtn, .prompt__plus{ transition:none !important; }
      }

      @media (max-width: 560px){
        .hero{
          align-content: start;
          justify-items: start;
          text-align: left;
          padding: 64px 14px 12px;
          gap: 12px;
        }

        .hello{ justify-self: start; }
        .h1{ text-align: left; }

        .prompt{
          width: 100%;
          --ctl-h: 46px;
          gap: 8px;
          padding: 10px;
        }

        .prompt__input{
          padding: 12px 12px;
          border-radius: 14px;
        }

        .miniIcon{
          width: var(--ctl-h);
          height: var(--ctl-h);
          border-radius: 14px;
        }

        .prompt__plus{
          width: var(--ctl-h);
          height: var(--ctl-h);
          border-radius: 14px;
        }

        .chips{
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          width: 100%;
          gap: 10px;
          margin-top: 6px;
        }

        .chip{
          width: fit-content;
          max-width: 100%;
        }

        .msgs{
          max-width: 100%;
          padding: 0 2px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPage {
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly listening = signal(false);
  readonly simultaneous = signal(false);
  readonly mode = signal<Mode>('quick');

  readonly draft = signal('');
  readonly messages = signal<Msg[]>([]);

  readonly userTag = computed(() => {
    const email = this.auth.session()?.user?.email ?? '';
    const raw = email.split('@')[0]?.trim();
    return raw ? raw : this.translate.instant('CHAT.USER_FALLBACK');
  });

  readonly canSend = computed(() => (this.draft() ?? '').trim().length > 0);

  trackById = (_: number, m: Msg) => m.id;

  seed(keyOrText: string) {
    const t = this.translate.instant(keyOrText);
    this.draft.set(t !== keyOrText ? t : keyOrText);
  }

  tools() {
    this.toast.push({
      type: 'info',
      title: this.translate.instant('CHAT.TOAST.ACTIONS_TITLE'),
      message: this.translate.instant('CHAT.TOAST.ACTIONS_MSG'),
    });
  }

  toggleMode() {
    this.mode.update((m) => (m === 'quick' ? 'detailed' : 'quick'));

    const modeLabel = this.translate.instant(this.mode() === 'quick' ? 'CHAT.MODE.QUICK' : 'CHAT.MODE.DETAILED');
    this.toast.push({
      type: 'info',
      title: this.translate.instant('CHAT.TOAST.MODE_TITLE'),
      message: this.translate.instant('CHAT.TOAST.MODE_MSG', { mode: modeLabel }),
    });
  }

  toggleVoice() {
    const next = !this.listening();
    this.listening.set(next);

    if (next) {
      this.toast.push({
        type: 'info',
        title: this.translate.instant('CHAT.TOAST.VOICE_TITLE'),
        message: this.translate.instant('CHAT.TOAST.VOICE_ON'),
      });

      setTimeout(() => {
        if (!this.listening()) return;
        this.draft.set(this.translate.instant('CHAT.VOICE.TRANSCRIPT'));
        this.toast.push({
          type: 'success',
          title: this.translate.instant('CHAT.TOAST.VOICE_TITLE'),
          message: this.translate.instant('CHAT.TOAST.VOICE_TRANSCRIBED'),
        });
      }, 900);
    } else {
      this.toast.push({
        type: 'info',
        title: this.translate.instant('CHAT.TOAST.VOICE_TITLE'),
        message: this.translate.instant('CHAT.TOAST.VOICE_OFF'),
      });
    }
  }

  toggleSimultaneous() {
    const next = !this.simultaneous();
    this.simultaneous.set(next);

    this.toast.push({
      type: 'info',
      title: this.translate.instant('CHAT.TOAST.SIM_TITLE'),
      message: this.translate.instant(next ? 'CHAT.TOAST.SIM_ON' : 'CHAT.TOAST.SIM_OFF'),
    });
  }

  onEnter(ev: Event) {
    const k = ev as KeyboardEvent;
    if (k.shiftKey) return;
    k.preventDefault();
    this.send();
  }

  send() {
    const text = (this.draft() ?? '').trim();
    if (!text) return;

    const userMsg: Msg = { id: this.id(), role: 'user', text, at: Date.now() };
    this.messages.update((arr) => [...arr, userMsg]);
    this.draft.set('');

    setTimeout(() => {
      const replyKey = this.mode() === 'quick' ? 'CHAT.REPLY.QUICK' : 'CHAT.REPLY.DETAILED';
      const reply: Msg = {
        id: this.id(),
        role: 'assistant',
        text: this.translate.instant(replyKey),
        at: Date.now(),
      };
      this.messages.update((arr) => [...arr, reply]);
    }, 650);
  }

  private id() {
    return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}