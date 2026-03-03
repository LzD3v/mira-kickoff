import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiCardComponent } from '@ui/card/ui-card.component';
import { UiInputComponent } from '@ui/input/ui-input.component';
import { UiButtonComponent } from '@ui/button/ui-button.component';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type ThemePref = 'system' | 'dark' | 'light';
type WeekStart = 'mon' | 'sun';
type Currency = 'BRL' | 'USD' | 'EUR';
type Period = 7 | 30 | 90;

type Prefs = {
  notifications: boolean;
  weekly: boolean;
  weeklyEmail: boolean;

  autoCategorize: boolean;
  roundingSavings: boolean;

  theme: ThemePref;
  weekStart: WeekStart;
  currency: Currency;
  defaultInsightPeriod: Period;
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiCardComponent,
    UiInputComponent,
    UiButtonComponent,
    TranslateModule,
  ],
  template: `
    <div class="wrap">
      <header class="head">
        <div>
          <div class="title">{{ 'SETTINGS.TITLE' | translate }}</div>
          <div class="muted sub">{{ 'SETTINGS.SUB' | translate }}</div>
        </div>

        <div class="head__actions">
          <mira-ui-button
            type="button"
            variant="primary"
            [loading]="saving()"
            (click)="save()"
          >
            {{ 'SETTINGS.ACTIONS.SAVE' | translate }}
          </mira-ui-button>
        </div>
      </header>

      <form class="grid" [formGroup]="form" (ngSubmit)="save()">
        <!-- Perfil -->
        <mira-ui-card class="panel">
          <div class="card">
            <div class="profile">
              <div class="avatar" aria-hidden="true">{{ initials() }}</div>
              <div>
                <div class="profile__name">{{ form.value.name || '—' }}</div>
                <div class="muted profile__mail">{{ form.value.email || '—' }}</div>
              </div>
            </div>

            <div class="fields">
              <mira-ui-input
                [label]="'SETTINGS.PROFILE.NAME_LABEL' | translate"
                formControlName="name"
                [placeholder]="'SETTINGS.PROFILE.NAME_PH' | translate"
              />

              <mira-ui-input
                [label]="'SETTINGS.PROFILE.EMAIL_LABEL' | translate"
                type="email"
                formControlName="email"
                [placeholder]="'SETTINGS.PROFILE.EMAIL_PH' | translate"
              />
            </div>

            <div class="hint muted">
              {{ 'SETTINGS.PROFILE.HINT' | translate }}
            </div>
          </div>
        </mira-ui-card>

        <!-- Financeiro -->
        <mira-ui-card class="panel">
          <div class="card">
            <div class="sectionTitle">{{ 'SETTINGS.FINANCE.TITLE' | translate }}</div>
            <div class="muted sectionSub">{{ 'SETTINGS.FINANCE.SUB' | translate }}</div>

            <div class="fields">
              <label class="field">
                <span class="field__label">{{ 'SETTINGS.FINANCE.CURRENCY' | translate }}</span>
                <select
                  class="select focus-ring"
                  [value]="prefs().currency"
                  (change)="setCurrency($any($event.target).value)"
                >
                  <option value="BRL">{{ 'SETTINGS.FINANCE.CURRENCY_BRL' | translate }}</option>
                  <option value="USD">{{ 'SETTINGS.FINANCE.CURRENCY_USD' | translate }}</option>
                  <option value="EUR">{{ 'SETTINGS.FINANCE.CURRENCY_EUR' | translate }}</option>
                </select>
              </label>

              <mira-ui-input
                [label]="'SETTINGS.FINANCE.MONTHLY_BUDGET' | translate"
                type="number"
                formControlName="monthlyBudget"
                [placeholder]="'SETTINGS.FINANCE.MONTHLY_BUDGET_PH' | translate"
              />

              <mira-ui-input
                [label]="'SETTINGS.FINANCE.SAVINGS_GOAL' | translate"
                type="number"
                formControlName="savingsGoal"
                [placeholder]="'SETTINGS.FINANCE.SAVINGS_GOAL_PH' | translate"
              />

              <mira-ui-input
                [label]="'SETTINGS.FINANCE.PAYDAY' | translate"
                type="number"
                formControlName="payday"
                [placeholder]="'SETTINGS.FINANCE.PAYDAY_PH' | translate"
              />
            </div>

            <div class="hint muted">{{ 'SETTINGS.FINANCE.HINT' | translate }}</div>
          </div>
        </mira-ui-card>

        <!-- Preferências -->
        <mira-ui-card class="panel">
          <div class="card">
            <div class="sectionTitle">{{ 'SETTINGS.PREFS.TITLE' | translate }}</div>

            <div class="group">
              <div class="groupTitle">{{ 'SETTINGS.PREFS.GROUP_NOTIFS' | translate }}</div>

              <div class="pref">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.NOTIFS.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.NOTIFS.DESC' | translate }}</div>
                </div>

                <label class="switch" [attr.aria-label]="'SETTINGS.PREFS.NOTIFS.ARIA' | translate">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().notifications"
                    [attr.aria-checked]="prefs().notifications"
                    (change)="toggle('notifications', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.WEEKLY.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.WEEKLY.DESC' | translate }}</div>
                </div>

                <label class="switch" [attr.aria-label]="'SETTINGS.PREFS.WEEKLY.ARIA' | translate">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().weekly"
                    [attr.aria-checked]="prefs().weekly"
                    (change)="toggle('weekly', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.WEEKLY_EMAIL.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.WEEKLY_EMAIL.DESC' | translate }}</div>
                </div>

                <label class="switch" [attr.aria-label]="'SETTINGS.PREFS.WEEKLY_EMAIL.ARIA' | translate">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().weeklyEmail"
                    [attr.aria-checked]="prefs().weeklyEmail"
                    (change)="toggle('weeklyEmail', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.WEEK_START.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.WEEK_START.DESC' | translate }}</div>
                </div>

                <div class="pref__right">
                  <select
                    class="select focus-ring"
                    [value]="prefs().weekStart"
                    (change)="setWeekStart($any($event.target).value)"
                  >
                    <option value="mon">{{ 'SETTINGS.PREFS.WEEK_START.MON' | translate }}</option>
                    <option value="sun">{{ 'SETTINGS.PREFS.WEEK_START.SUN' | translate }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="group">
              <div class="groupTitle">{{ 'SETTINGS.PREFS.GROUP_INSIGHTS' | translate }}</div>

              <div class="pref">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.INSIGHTS_PERIOD.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.INSIGHTS_PERIOD.DESC' | translate }}</div>
                </div>

                <div class="pref__right">
                  <select
                    class="select focus-ring"
                    [value]="prefs().defaultInsightPeriod.toString()"
                    (change)="setDefaultInsightPeriod($any($event.target).value)"
                  >
                    <option value="7">{{ 'SETTINGS.PREFS.INSIGHTS_PERIOD.D7' | translate }}</option>
                    <option value="30">{{ 'SETTINGS.PREFS.INSIGHTS_PERIOD.D30' | translate }}</option>
                    <option value="90">{{ 'SETTINGS.PREFS.INSIGHTS_PERIOD.D90' | translate }}</option>
                  </select>
                </div>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.AUTO_CAT.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.AUTO_CAT.DESC' | translate }}</div>
                </div>

                <label class="switch" [attr.aria-label]="'SETTINGS.PREFS.AUTO_CAT.ARIA' | translate">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().autoCategorize"
                    [attr.aria-checked]="prefs().autoCategorize"
                    (change)="toggle('autoCategorize', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>

              <div class="pref">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.ROUNDING.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.ROUNDING.DESC' | translate }}</div>
                </div>

                <label class="switch" [attr.aria-label]="'SETTINGS.PREFS.ROUNDING.ARIA' | translate">
                  <input
                    type="checkbox"
                    role="switch"
                    [checked]="prefs().roundingSavings"
                    [attr.aria-checked]="prefs().roundingSavings"
                    (change)="toggle('roundingSavings', $event)"
                  />
                  <span class="track" aria-hidden="true"></span>
                </label>
              </div>
            </div>

            <div class="group">
              <div class="groupTitle">{{ 'SETTINGS.PREFS.GROUP_APPEARANCE' | translate }}</div>

              <div class="pref">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.THEME.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.THEME.DESC' | translate }}</div>
                </div>

                <div class="pref__right">
                  <select class="select focus-ring" [value]="prefs().theme" (change)="setTheme($any($event.target).value)">
                    <option value="system">{{ 'SETTINGS.PREFS.THEME.SYSTEM' | translate }}</option>
                    <option value="dark">{{ 'SETTINGS.PREFS.THEME.DARK' | translate }}</option>
                    <option value="light">{{ 'SETTINGS.PREFS.THEME.LIGHT' | translate }}</option>
                  </select>
                </div>
              </div>

              <div class="pref pref--actions">
                <div>
                  <div class="pref__name">{{ 'SETTINGS.PREFS.DEFAULTS.NAME' | translate }}</div>
                  <div class="muted pref__desc">{{ 'SETTINGS.PREFS.DEFAULTS.DESC' | translate }}</div>
                </div>

                <mira-ui-button type="button" variant="secondary" (click)="restoreDefaults()">
                  {{ 'SETTINGS.PREFS.DEFAULTS.RESTORE' | translate }}
                </mira-ui-button>
              </div>
            </div>
          </div>
        </mira-ui-card>

        <!-- Sessão -->
        <mira-ui-card class="panel wide">
          <div class="card">
            <div class="sectionTitle">{{ 'SETTINGS.SESSION.TITLE' | translate }}</div>
            <div class="muted">
              {{ 'SETTINGS.SESSION.LOGGED_AS' | translate }}:
              <b>{{ auth.session()?.user?.email ?? '—' }}</b>
            </div>

            <div class="danger">
              <div>
                <div class="danger__t">{{ 'SETTINGS.SESSION.LOGOUT_TITLE' | translate }}</div>
                <div class="muted danger__d">{{ 'SETTINGS.SESSION.LOGOUT_DESC' | translate }}</div>
              </div>

              <mira-ui-button type="button" variant="secondary" (click)="auth.logout()">
                {{ 'SETTINGS.SESSION.LOGOUT_BTN' | translate }}
              </mira-ui-button>
            </div>
          </div>
        </mira-ui-card>

        <!-- Dados -->
        <mira-ui-card class="panel wide">
          <div class="card">
            <div class="sectionTitle">{{ 'SETTINGS.DATA.TITLE' | translate }}</div>
            <div class="muted">{{ 'SETTINGS.DATA.SUB' | translate }}</div>

            <div class="dataRow">
              <div>
                <div class="dataRow__t">{{ 'SETTINGS.DATA.EXPORT.TITLE' | translate }}</div>
                <div class="muted dataRow__d">{{ 'SETTINGS.DATA.EXPORT.DESC' | translate }}</div>
              </div>
              <mira-ui-button type="button" variant="secondary" (click)="exportPrefs()">
                {{ 'SETTINGS.DATA.EXPORT.BTN' | translate }}
              </mira-ui-button>
            </div>

            <div class="dataRow dangerRow">
              <div>
                <div class="dataRow__t">{{ 'SETTINGS.DATA.CLEAR.TITLE' | translate }}</div>
                <div class="muted dataRow__d">{{ 'SETTINGS.DATA.CLEAR.DESC' | translate }}</div>
              </div>
              <mira-ui-button type="button" variant="secondary" (click)="clearLocalData()">
                {{ 'SETTINGS.DATA.CLEAR.BTN' | translate }}
              </mira-ui-button>
            </div>
          </div>
        </mira-ui-card>
      </form>
    </div>
  `,
  styleUrls: [],
  styles: [
    `
      :host { display: block; }
      mira-ui-card { display: block; min-width: 0; }

      .wrap{
        max-width: 1040px;
        margin: 0 auto;
        display: grid;
        gap: 14px;
      }

      .head{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:12px;
        flex-wrap:wrap;
      }

      .title{
        font-weight: 950;
        font-size: 18px;
        letter-spacing: -0.2px;
      }
      .sub{ font-size: 12px; margin-top: 2px; }

      .head__actions{ display:flex; gap:10px; flex-wrap:wrap; }

      .grid{
        display:grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }

      mira-ui-card.panel{
        padding: 0;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.10);
        background: linear-gradient(180deg, rgba(15,18,26,0.56), rgba(12,14,20,0.34));
        box-shadow: 0 24px 80px rgba(0,0,0,0.26);
        backdrop-filter: blur(12px);
        overflow: hidden;
        animation: rise 220ms ease both;
      }

      .card{
        padding: 16px;
        display:grid;
        gap: 14px;
      }

      .sectionTitle{
        font-weight: 950;
        letter-spacing: -0.2px;
      }

      .sectionSub{
        font-size: 12px;
        margin-top: -6px;
      }

      .profile{
        display:flex;
        align-items:center;
        gap: 12px;
      }

      .avatar{
        width: 46px;
        height: 46px;
        border-radius: 16px;
        display:grid;
        place-items:center;
        font-weight: 950;
        letter-spacing: -0.2px;
        background: rgba(124, 92, 255, 0.16);
        border: 1px solid rgba(124, 92, 255, 0.22);
        box-shadow: 0 18px 50px rgba(0,0,0,0.24);
      }

      .profile__name{
        font-weight: 950;
        letter-spacing: -0.2px;
      }

      .profile__mail{ font-size: 12px; }

      .fields{
        display:grid;
        gap: 12px;
      }

      .hint{ font-size: 12px; }

      .group{
        display:grid;
        gap: 10px;
        padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .group:first-of-type{
        padding-top: 0;
        border-top: 0;
      }
      .groupTitle{
        font-weight: 950;
        font-size: 12px;
        letter-spacing: -0.1px;
        color: rgba(255,255,255,0.86);
      }

      .pref{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 16px;
      }

      .pref__name{ font-weight: 850; }
      .pref__desc{
        font-size: 12px;
        margin-top: 2px;
        max-width: 54ch;
      }

      .pref__right{
        display:flex;
        justify-content:flex-end;
        min-width: 200px;
      }

      .pref--actions{
        padding-top: 2px;
      }

      .field{ display:grid; gap: 7px; min-width: 0; }
      .field__label{
        font-size: 12px;
        color: var(--muted, rgba(255,255,255,0.72));
        font-weight: 850;
      }

      .select{
        width: 100%;
        border-radius: 16px;
        padding: 12px 44px 12px 12px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.045);
        color: rgba(255,255,255,0.92);
        outline: none;
        min-height: 44px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: border-color 160ms ease, background 160ms ease;
      }
      .select:hover{ background: rgba(255,255,255,0.06); }
      .select:focus{ border-color: rgba(133,94,217,0.45); }
      .select option{
        background: rgba(12,14,20,1);
        color: rgba(255,255,255,0.92);
      }

      .switch{ position: relative; display: inline-flex; align-items: center; flex: 0 0 auto; }

      .switch input{
        width: 52px;
        height: 30px;
        appearance: none;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.06);
        cursor: pointer;
        outline: none;
        transition: background 180ms ease, border-color 180ms ease;
      }

      .switch input:focus-visible { box-shadow: var(--focus); }

      .switch .track{
        position:absolute;
        left: 8px;
        top: 7px;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: rgba(255,255,255,0.44);
        border: 1px solid rgba(255,255,255,0.16);
        box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
        pointer-events:none;
      }

      .switch input:checked{
        border-color: rgba(124,92,255,0.45);
        background: rgba(124,92,255,0.18);
      }

      .switch input:checked + .track{
        transform: translateX(22px);
        background: rgba(35,209,195,0.90);
        border-color: rgba(35,209,195,0.35);
      }

      .danger{
        margin-top: 6px;
        padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .danger__t{ font-weight: 950; }
      .danger__d{ font-size: 12px; margin-top: 2px; }

      .dataRow{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
        flex-wrap: wrap;
      }
      .dataRow:first-of-type{
        border-top: 0;
        padding-top: 0;
      }
      .dataRow__t{ font-weight: 950; }
      .dataRow__d{ font-size: 12px; margin-top: 2px; }

      .dangerRow{
        border-top-color: rgba(255,92,122,0.20);
      }

      @media (min-width: 980px){
        .grid{
          grid-template-columns: 1fr 1fr;
          align-items: start;
        }
        .wide{ grid-column: 1 / -1; }
        .fields{ grid-template-columns: 1fr 1fr; }
      }

      @keyframes rise{
        from{ opacity: 0; transform: translateY(6px); }
        to{ opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce){
        mira-ui-card.panel{ animation: none !important; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly t = inject(TranslateService);

  readonly saving = signal(false);

  private readonly PROFILE_KEY = 'mira_profile_v2';
  private readonly PREFS_KEY = 'mira_prefs_v2';
  private readonly PREFS_OLD_KEY = 'mira_prefs_v1';

  readonly prefs = signal<Prefs>(this.loadPrefs());

  readonly form = this.fb.group({
    name: ['Demo User', [Validators.required]],
    email: [this.auth.session()?.user?.email ?? 'demo@mira.app', [Validators.required, Validators.email]],

    monthlyBudget: ['3500'],
    savingsGoal: ['500'],
    payday: ['5'],
  });

  constructor() {
    const saved = this.loadProfile();
    if (saved) this.form.patchValue(saved, { emitEvent: false });
    this.applyTheme(this.prefs().theme);
  }

  initials() {
    const n = (this.form.value.name ?? '').trim();
    if (!n) return 'M';
    const parts = n.split(' ').filter(Boolean);
    return (parts[0]?.[0] ?? 'M').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
  }

  private loadProfile(): Partial<{ name: string; email: string; monthlyBudget: string; savingsGoal: string; payday: string }> | null {
    try {
      const raw = localStorage.getItem(this.PROFILE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as any;
      return {
        name: typeof parsed?.name === 'string' ? parsed.name : undefined,
        email: typeof parsed?.email === 'string' ? parsed.email : undefined,
        monthlyBudget: parsed?.monthlyBudget != null ? String(parsed.monthlyBudget) : undefined,
        savingsGoal: parsed?.savingsGoal != null ? String(parsed.savingsGoal) : undefined,
        payday: parsed?.payday != null ? String(parsed.payday) : undefined,
      };
    } catch {
      return null;
    }
  }

  private persistProfile() {
    try {
      const v = this.form.getRawValue();
      localStorage.setItem(
        this.PROFILE_KEY,
        JSON.stringify({
          name: (v.name ?? '').toString().trim(),
          email: (v.email ?? '').toString().trim(),
          monthlyBudget: (v.monthlyBudget ?? '').toString().trim(),
          savingsGoal: (v.savingsGoal ?? '').toString().trim(),
          payday: (v.payday ?? '').toString().trim(),
        }),
      );
    } catch {}
  }

  private loadPrefs(): Prefs {
    const fallback: Prefs = {
      notifications: true,
      weekly: false,
      weeklyEmail: false,

      autoCategorize: true,
      roundingSavings: true,

      theme: 'system',
      weekStart: 'mon',
      currency: 'BRL',
      defaultInsightPeriod: 30,
    };

    try {
      const rawV2 = localStorage.getItem(this.PREFS_KEY);
      if (rawV2) {
        const p = JSON.parse(rawV2) as Partial<Prefs>;
        return { ...fallback, ...p } as Prefs;
      }

      // migra do v1
      const rawV1 = localStorage.getItem(this.PREFS_OLD_KEY);
      if (rawV1) {
        const old = JSON.parse(rawV1) as any;
        const migrated: Partial<Prefs> = {
          notifications: !!old?.notifications,
          weekly: !!old?.weekly,
        };
        const next = { ...fallback, ...migrated };
        try { localStorage.setItem(this.PREFS_KEY, JSON.stringify(next)); } catch {}
        return next;
      }

      return fallback;
    } catch {
      return fallback;
    }
  }

  private persistPrefs(p: Prefs) {
    try {
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(p));
    } catch {}
  }

  toggle(key: 'notifications' | 'weekly' | 'weeklyEmail' | 'autoCategorize' | 'roundingSavings', ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    this.prefs.update((p) => {
      const next = { ...p, [key]: checked } as Prefs;
      this.persistPrefs(next);
      return next;
    });
  }

  setTheme(theme: ThemePref) {
    this.prefs.update((p) => {
      const next = { ...p, theme };
      this.persistPrefs(next);
      return next;
    });
    this.applyTheme(theme);
  }

  setWeekStart(v: WeekStart) {
    this.prefs.update((p) => {
      const next = { ...p, weekStart: v };
      this.persistPrefs(next);
      return next;
    });
  }

  setCurrency(v: Currency) {
    this.prefs.update((p) => {
      const next = { ...p, currency: v };
      this.persistPrefs(next);
      return next;
    });
  }

  setDefaultInsightPeriod(v: string) {
    const n = Number(v);
    const period: Period = (n === 7 || n === 30 || n === 90 ? n : 30) as Period;
    this.prefs.update((p) => {
      const next = { ...p, defaultInsightPeriod: period };
      this.persistPrefs(next);
      return next;
    });
  }

  restoreDefaults() {
    const clean: Prefs = {
      notifications: true,
      weekly: false,
      weeklyEmail: false,
      autoCategorize: true,
      roundingSavings: true,
      theme: 'system',
      weekStart: 'mon',
      currency: 'BRL',
      defaultInsightPeriod: 30,
    };

    this.prefs.set(clean);
    this.persistPrefs(clean);
    this.applyTheme(clean.theme);

    this.toast.push({
      type: 'success',
      title: this.t.instant('SETTINGS.TOAST.RESTORED_TITLE'),
      message: this.t.instant('SETTINGS.TOAST.RESTORED_MSG'),
    });
  }

  exportPrefs() {
    this.toast.push({
      type: 'success',
      title: this.t.instant('SETTINGS.TOAST.EXPORTED_TITLE'),
      message: this.t.instant('SETTINGS.TOAST.EXPORTED_MSG'),
    });
  }

  clearLocalData() {
    try {
      localStorage.removeItem(this.PREFS_KEY);
      localStorage.removeItem(this.PREFS_OLD_KEY);
      localStorage.removeItem(this.PROFILE_KEY);
    } catch {}

    this.prefs.set(this.loadPrefs());
    const sessionEmail = this.auth.session()?.user?.email ?? 'demo@mira.app';

    this.form.reset(
      {
        name: 'Demo User',
        email: sessionEmail,
        monthlyBudget: '3500',
        savingsGoal: '500',
        payday: '5',
      },
      { emitEvent: false },
    );

    this.applyTheme(this.prefs().theme);

    this.toast.push({
      type: 'success',
      title: this.t.instant('SETTINGS.TOAST.CLEARED_TITLE'),
      message: this.t.instant('SETTINGS.TOAST.CLEARED_MSG'),
    });
  }

  private applyTheme(theme: ThemePref) {
    try {
      const root = document.documentElement;
      if (theme === 'dark' || theme === 'light') {
        root.setAttribute('data-theme', theme);
        return;
      }

      const isLight =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      root.setAttribute('data-theme', isLight ? 'light' : 'dark');
    } catch {}
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.push({
        type: 'warning',
        title: this.t.instant('SETTINGS.TOAST.REVIEW_TITLE'),
        message: this.t.instant('SETTINGS.TOAST.REVIEW_MSG'),
      });
      return;
    }

    this.saving.set(true);
    await new Promise((r) => setTimeout(r, 450));
    this.saving.set(false);

    this.persistProfile();
    this.persistPrefs(this.prefs());

    this.toast.push({
      type: 'success',
      title: this.t.instant('SETTINGS.TOAST.SAVED_TITLE'),
      message: this.t.instant('SETTINGS.TOAST.SAVED_MSG'),
    });
  }
}